import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { ChatWidget } from '@/features/chatbot/components/chat-widget';
import { createServerSupabase } from '@/lib/supabase/server';

/** Layout de la tienda pública: navbar fija + contenido + footer. */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar isAuthed={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
