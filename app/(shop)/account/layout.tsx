import { AccountNav } from '@/features/account/components/account-nav';
import { SignOutButton } from '@/features/auth/components/sign-out-button';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-4xl md:text-5xl">Mi cuenta</h1>
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="min-w-0 space-y-6">
          <AccountNav />
          <SignOutButton className="w-full" />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
