'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { ProductSummary } from '@/types/product';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  products?: ProductSummary[];
}

const SUGGESTIONS = [
  '¿Qué hay en oferta?',
  'Muéstrame vestidos',
  '¿Cuál es el más vendido?',
  'Chaquetas para clima frío',
];

const GREETING: Msg = {
  role: 'assistant',
  content:
    '¡Hola! Soy tu asistente de Átelier. Puedo ayudarte a encontrar prendas, tallas, colores, ofertas y recomendaciones. ¿Qué buscas hoy?',
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.content)
            .map((m) => ({ role: m.role, content: m.content }))
            .slice(-12),
          conversationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error ?? 'Lo siento, ocurrió un error. Intenta de nuevo.' },
        ]);
      } else {
        if (data.conversationId) setConversationId(data.conversationId);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message, products: data.products },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'No pude conectar con el asistente. Revisa tu conexión.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        className="fixed right-4 bottom-4 z-50 grid size-14 place-items-center bg-foreground text-background shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed right-4 bottom-20 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col border-2 border-foreground bg-background shadow-2xl transition-all sm:right-6 sm:bottom-24',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        role="dialog"
        aria-label="Asistente de compras"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b-2 border-foreground bg-foreground px-4 py-3 text-background">
          <Sparkles className="size-4" />
          <div>
            <p className="font-display text-sm font-black uppercase">Asistente Átelier</p>
            <p className="text-[0.65rem] text-background/60">Respuestas con datos reales de la tienda</p>
          </div>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[85%] px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'bg-foreground text-background'
                    : 'border-2 border-border bg-secondary/40',
                )}
              >
                {m.content}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="grid w-full grid-cols-1 gap-2">
                  {m.products.slice(0, 4).map((p) => (
                    <MiniProduct key={p.id} product={p} onNavigate={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Escribiendo…
            </div>
          )}
        </div>

        {/* Sugerencias */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="border-2 border-border px-2 py-1 text-xs transition-colors hover:border-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t-2 border-foreground p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta…"
            className="h-10 flex-1 border-2 border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
            aria-label="Mensaje"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid size-10 shrink-0 place-items-center bg-foreground text-background disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}

function MiniProduct({
  product,
  onNavigate,
}: {
  product: ProductSummary;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-3 border-2 border-border p-2 transition-colors hover:border-foreground"
    >
      <div className="relative size-14 shrink-0 overflow-hidden bg-muted">
        {product.imageUrl && (
          <Image src={product.imageUrl} alt={product.name} fill sizes="56px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold uppercase">{product.name}</p>
        <p className="text-xs tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
