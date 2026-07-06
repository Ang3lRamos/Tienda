import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ShopNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="display-xxl text-[22vw] leading-none md:text-[12rem]">404</p>
      <h1 className="mt-2 text-3xl">No encontramos esto</h1>
      <p className="mt-2 text-muted-foreground">
        El producto o la página que buscas no está disponible.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/catalogo">Explorar catálogo</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
