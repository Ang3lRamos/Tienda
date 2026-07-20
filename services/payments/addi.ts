import 'server-only';

import { getServerEnv } from '@/config/env';
import type { PaymentInput, PaymentProvider, PaymentResult } from './index';

/**
 * Proveedor de pago Addi (Buy Now, Pay Later — Colombia).
 *
 * Flujo "Web Checkout":
 *  1. Autenticación OAuth2 (Auth0) con `client_credentials` → token Bearer.
 *  2. Se crea una solicitud de crédito ("application") con el detalle del pedido
 *     y las URLs de retorno; Addi responde con una URL a la que se redirige al
 *     comprador para completar el proceso en su portal.
 *  3. Addi notifica el resultado por webhook (ver `app/api/payments/addi/webhook`).
 *
 * ⚠️ Los endpoints exactos, el `audience`, el `allySlug` y las credenciales los
 * entrega Addi en el onboarding (correo cifrado, sandbox y producción). Todo es
 * configurable por entorno (`ADDI_*`). Verifica el mapeo de campos de la
 * request/response contra la documentación que te entreguen: aquí se sigue el
 * contrato público de Web Checkout y se lee la URL de redirección de forma
 * tolerante (varios nombres posibles).
 */

interface AddiTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}

// Cache simple del token en memoria del proceso (evita pedir uno por request).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const env = getServerEnv();
  if (!env.ADDI_CLIENT_ID || !env.ADDI_CLIENT_SECRET) {
    throw new Error('Addi no está configurado. Define ADDI_CLIENT_ID y ADDI_CLIENT_SECRET.');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const res = await fetch(env.ADDI_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.ADDI_CLIENT_ID,
      client_secret: env.ADDI_CLIENT_SECRET,
      audience: env.ADDI_AUDIENCE,
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Addi auth falló (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as AddiTokenResponse;
  if (!data.access_token) throw new Error('Addi no devolvió access_token.');

  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ? data.expires_in * 1000 : 3_600_000),
  };
  return data.access_token;
}

/** Extrae la URL de redirección de la respuesta, tolerando distintos nombres. */
function extractRedirectUrl(payload: Record<string, unknown>): string | undefined {
  const candidates = [
    payload.redirectionUrl,
    payload.redirectUrl,
    payload.gatewayUrl,
    payload.checkoutUrl,
    payload.url,
    (payload.data as Record<string, unknown> | undefined)?.redirectionUrl,
  ];
  return candidates.find((c): c is string => typeof c === 'string' && c.length > 0);
}

function extractApplicationId(payload: Record<string, unknown>): string | undefined {
  const candidates = [payload.applicationId, payload.id, payload.orderId];
  return candidates.find((c): c is string => typeof c === 'string' && c.length > 0);
}

export const addiProvider: PaymentProvider = {
  method: 'addi',
  async createPayment(input: PaymentInput): Promise<PaymentResult> {
    const env = getServerEnv();
    const token = await getAccessToken();

    const site = (input.siteUrl ?? '').replace(/\/$/, '');
    const orderPath = `${site}/pedido/${input.orderNumber}`;

    // Cuerpo según el contrato de Web Checkout de Addi. Ajusta los campos a la
    // documentación de tu onboarding si difieren.
    const body = {
      allySlug: env.ADDI_ALLY_SLUG,
      orderId: input.orderNumber,
      totalAmount: input.amount,
      shippingAmount: input.shippingAmount ?? 0,
      totalTaxes: input.taxAmount ?? 0,
      currency: input.currency,
      items: (input.items ?? []).map((it) => ({
        sku: it.sku ?? undefined,
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        pricePerUnit: it.unitPrice,
      })),
      client: {
        email: input.customer?.email ?? undefined,
        firstName: input.customer?.fullName?.split(' ')[0] ?? undefined,
        lastName: input.customer?.fullName?.split(' ').slice(1).join(' ') || undefined,
        cellphone: input.customer?.phone ?? undefined,
        address: input.shippingAddress
          ? {
              line1: input.shippingAddress.line1,
              line2: input.shippingAddress.line2 ?? undefined,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state ?? undefined,
              country: input.shippingAddress.country,
            }
          : undefined,
      },
      redirectionUrl: {
        approvedUrl: `${orderPath}?addi=approved`,
        callbackUrl: `${orderPath}?addi=approved`,
        rejectedUrl: `${orderPath}?addi=rejected`,
        declineUrl: `${orderPath}?addi=rejected`,
        logoutUrl: orderPath,
      },
    };

    const res = await fetch(`${env.ADDI_API_URL}/v1/online-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Addi rechazó la solicitud (${res.status}): ${detail.slice(0, 200)}`);
    }

    const payload = (await res.json()) as Record<string, unknown>;
    const redirectUrl = extractRedirectUrl(payload);
    const reference = extractApplicationId(payload);

    if (!redirectUrl) {
      throw new Error('Addi no devolvió una URL de redirección.');
    }

    return { status: 'pending', reference, provider: 'addi', redirectUrl };
  },
};
