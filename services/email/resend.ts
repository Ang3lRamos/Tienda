import 'server-only';

import { getServerEnv } from '@/config/env';
import type { EmailMessage, EmailProvider } from './index';

/**
 * Proveedor Resend (https://resend.com) sobre su API REST, sin dependencias
 * añadidas — mismo enfoque que `services/payments/addi.ts`.
 *
 * Requiere `RESEND_API_KEY` y un `EMAIL_FROM` cuyo dominio esté verificado en
 * el panel de Resend; si no lo está, la API rechaza el envío.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export const resendProvider: EmailProvider = {
  name: 'resend',

  isConfigured() {
    return Boolean(getServerEnv().RESEND_API_KEY);
  },

  async send(message: EmailMessage, from: string, replyTo?: string) {
    const { RESEND_API_KEY } = getServerEnv();

    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Resend respondió ${res.status}: ${detail.slice(0, 300)}`);
    }
  },
};
