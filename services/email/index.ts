import 'server-only';

import { getServerEnv } from '@/config/env';
import { resendProvider } from './resend';

/**
 * Capa de correo desacoplada, con el mismo patrón que `services/payments`: el
 * resto de la app depende de `sendEmail`, no de un proveedor concreto.
 *
 * Regla de oro: **enviar un correo nunca debe romper una operación de negocio**.
 * Si no hay proveedor configurado o el envío falla, se registra y se continúa;
 * un pedido válido jamás se pierde porque el correo no salga.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Alternativa en texto plano (mejora la entregabilidad). */
  text: string;
}

export interface EmailProvider {
  name: string;
  /** true si tiene credenciales suficientes para enviar. */
  isConfigured(): boolean;
  send(message: EmailMessage, from: string, replyTo?: string): Promise<void>;
}

export type EmailResult =
  | { ok: true; provider: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; reason: string };

const providers: EmailProvider[] = [resendProvider];

function getProvider(): EmailProvider | null {
  return providers.find((p) => p.isConfigured()) ?? null;
}

/** true si hay algún proveedor de correo listo para enviar. */
export function isEmailEnabled(): boolean {
  return getProvider() !== null;
}

/**
 * Envía un correo. No lanza nunca: devuelve el resultado para que quien llama
 * decida si registrarlo. Si no hay proveedor configurado, se omite en silencio
 * (la tienda funciona igual, solo que sin notificaciones).
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const provider = getProvider();
  if (!provider) {
    return { ok: false, skipped: true, reason: 'Sin proveedor de correo configurado' };
  }

  const env = getServerEnv();
  if (!env.EMAIL_FROM) {
    return { ok: false, skipped: true, reason: 'Falta EMAIL_FROM' };
  }

  try {
    await provider.send(message, env.EMAIL_FROM, env.EMAIL_REPLY_TO);
    return { ok: true, provider: provider.name };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`[email] fallo al enviar "${message.subject}" a ${message.to}: ${reason}`);
    return { ok: false, skipped: false, reason };
  }
}
