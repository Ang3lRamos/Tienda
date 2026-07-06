import type { Metadata } from 'next';
import { getChatAnalytics } from '@/features/admin/lists';
import { StatCard } from '@/features/admin/components/stat-card';

export const metadata: Metadata = { title: 'Chat IA' };

export default async function AdminChatAIPage() {
  const a = await getChatAnalytics();
  const maxCount = Math.max(1, ...a.topProducts.map((p) => p.count));

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker text-muted-foreground">Asistente</p>
        <h1 className="mt-1 text-4xl md:text-5xl">Dashboard de IA</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Conversaciones" value={a.totalConversations} accent />
        <StatCard label="Mensajes" value={a.totalMessages} />
        <StatCard label="Preguntas de clientes" value={a.userMessages} />
      </div>

      <div className="border-2 border-foreground p-5">
        <h2 className="mb-4 text-xl">Productos más consultados por la IA</h2>
        {a.topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay consultas registradas. Cuando los clientes usen el asistente,
            aquí verás los productos más recomendados.
          </p>
        ) : (
          <ul className="space-y-4">
            {a.topProducts.map((p) => (
              <li key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium uppercase">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">{p.count}</span>
                </div>
                <div className="mt-1.5 h-2 bg-secondary">
                  <div className="h-full bg-foreground" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
