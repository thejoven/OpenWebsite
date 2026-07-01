import { AdminNav } from "./admin-nav";

export function AdminShell({
  children,
  email
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="admin-root min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)] lg:flex">
      <AdminNav email={email} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
