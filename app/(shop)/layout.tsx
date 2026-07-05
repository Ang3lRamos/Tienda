import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/** Layout de la tienda pública: navbar fija + contenido + footer. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
