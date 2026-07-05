import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runChat, type ChatMessage } from '@/services/chatbot/openrouter';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import { getServerEnv } from '@/config/env';

export const runtime = 'nodejs';
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
  conversationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  const { OPENROUTER_API_KEY } = getServerEnv();
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'El asistente no está configurado (falta OPENROUTER_API_KEY).' },
      { status: 503 },
    );
  }

  let result;
  try {
    result = await runChat(parsed.messages as ChatMessage[]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error del asistente';
    return NextResponse.json(
      { error: `No fue posible responder ahora mismo. ${message}` },
      { status: 502 },
    );
  }

  // Persistencia best-effort para el dashboard de IA (no bloquea la respuesta).
  const conversationId = await persist(parsed.conversationId, parsed.messages, result).catch(
    () => parsed.conversationId,
  );

  return NextResponse.json({
    message: result.message,
    products: result.products,
    conversationId,
  });
}

async function persist(
  conversationId: string | undefined,
  messages: ChatMessage[],
  result: { message: string; products: { id: string }[] },
): Promise<string | undefined> {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY) return conversationId;

  const admin = createAdminSupabase();

  // Usuario actual (si hay sesión) para asociar la conversación.
  let userId: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    /* invitado */
  }

  let convId = conversationId;
  if (!convId) {
    const { data } = await admin
      .from('chatbot_conversations')
      .insert({ user_id: userId } as never)
      .select('id')
      .single();
    convId = (data as { id: string } | null)?.id;
  }
  if (!convId) return undefined;

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const rows = [
    lastUser && {
      conversation_id: convId,
      role: 'user',
      content: lastUser.content,
    },
    {
      conversation_id: convId,
      role: 'assistant',
      content: result.message,
      referenced_products: result.products.map((p) => p.id),
    },
  ].filter(Boolean);

  await admin.from('chatbot_messages').insert(rows as never);
  return convId;
}
