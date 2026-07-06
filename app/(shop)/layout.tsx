import { Navbar } from '@/components/layout/navbar';
import { ConditionalFooter } from '@/components/layout/conditional-footer';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { AccountSync } from '@/features/sync/components/account-sync';
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Saltar al contenido
      </a>
      <Navbar isAuthed={!!user} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ConditionalFooter />
      <CartDrawer />
      <ChatWidget />
      <AccountSync isAuthed={!!user} />
    </div>
  );
}
