import { AlertTriangle } from 'lucide-react';
import { hasPendingLegalData } from '@/config/legal';

/**
 * Aviso visible mientras los datos del responsable sigan sin completarse en
 * `config/legal.ts`. Evita publicar una política legal con huecos sin que nadie
 * se dé cuenta.
 */
export function LegalPendingNotice() {
  if (!hasPendingLegalData()) return null;

  return (
    <div className="mb-10 flex gap-3 border-2 border-foreground bg-muted p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="font-display font-bold uppercase">Documento sin finalizar</p>
        <p className="text-muted-foreground">
          Faltan los datos del responsable (razón social, NIT y domicilio) en{' '}
          <code className="font-mono text-foreground">config/legal.ts</code>. Este texto es una
          plantilla de partida y debe revisarlo un abogado antes de abrir la tienda al público.
        </p>
      </div>
    </div>
  );
}
