import 'server-only';

import OpenAI from 'openai';
import { getServerEnv } from '@/config/env';
import { SYSTEM_PROMPT } from './system-prompt';
import { toolDefinitions, toolExecutors } from './tools';
import type { ProductSummary } from '@/types/product';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  message: string;
  products: ProductSummary[];
}

const MAX_STEPS = 5;

// Modelos gratuitos de respaldo (todos con soporte de tool calling). Si el
// principal está saturado (429), se prueba el siguiente automáticamente.
const FALLBACK_MODELS = [
  'openai/gpt-oss-20b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-31b-it:free',
];

function getClient() {
  const { OPENROUTER_API_KEY } = getServerEnv();
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY no está configurada');
  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    maxRetries: 0, // el fallback de modelo maneja los 429
    defaultHeaders: {
      'HTTP-Referer': 'https://atelier.store',
      'X-Title': 'Atelier Store',
    },
  });
}

function modelList(): string[] {
  const { OPENROUTER_MODEL } = getServerEnv();
  return [...new Set([OPENROUTER_MODEL, ...FALLBACK_MODELS])];
}

function isRetryable(err: unknown): boolean {
  return err instanceof OpenAI.APIError && [429, 502, 503].includes(err.status ?? 0);
}

/**
 * Ejecuta el bucle de tool calling: el modelo puede pedir herramientas, las
 * ejecutamos contra Supabase y le devolvemos los resultados, hasta MAX_STEPS.
 */
export async function runChat(history: ChatMessage[]): Promise<ChatResult> {
  const client = getClient();
  const models = modelList();
  let modelIdx = 0;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Llama al modelo; ante 429/5xx prueba el siguiente modelo del fallback.
  async function create(withTools: boolean) {
    let lastErr: unknown;
    while (modelIdx < models.length) {
      try {
        return await client.chat.completions.create({
          model: models[modelIdx],
          messages,
          temperature: 0.4,
          ...(withTools ? { tools: toolDefinitions, tool_choice: 'auto' as const } : {}),
        });
      } catch (err) {
        lastErr = err;
        if (isRetryable(err)) {
          modelIdx++;
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  const collected: ProductSummary[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const completion = await create(true);

    const choice = completion.choices[0]?.message;
    if (!choice) break;

    // Sin tool calls → respuesta final.
    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return { message: choice.content ?? '', products: dedupe(collected) };
    }

    // Añade el turno del asistente con las tool_calls.
    messages.push(choice);

    // Ejecuta cada herramienta y añade su resultado.
    for (const call of choice.tool_calls) {
      if (call.type !== 'function') continue;
      const executor = toolExecutors[call.function.name];
      let toolOutput: unknown = { error: 'Herramienta desconocida' };
      if (executor) {
        try {
          const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
          const res = await executor(args);
          toolOutput = res.result;
          if (res.products) collected.push(...res.products);
        } catch (err) {
          toolOutput = { error: err instanceof Error ? err.message : 'Error ejecutando la herramienta' };
        }
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(toolOutput),
      });
    }
  }

  // Se agotaron los pasos: una última llamada sin herramientas para cerrar.
  const final = await create(false);
  return {
    message: final.choices[0]?.message?.content ?? 'Lo siento, no pude completar la respuesta.',
    products: dedupe(collected),
  };
}

function dedupe(products: ProductSummary[]): ProductSummary[] {
  const seen = new Set<string>();
  return products.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 6);
}
