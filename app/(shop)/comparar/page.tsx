import type { Metadata } from 'next';
import { CompareTable } from '@/features/compare/components/compare-table';

export const metadata: Metadata = {
  title: 'Comparar productos',
  description: 'Compara precio, valoración, tallas y disponibilidad lado a lado.',
  robots: { index: false },
};

export default function CompararPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-5xl md:text-6xl">Comparar</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Revisa las diferencias entre los productos que te interesan.
      </p>
      <CompareTable />
    </div>
  );
}
