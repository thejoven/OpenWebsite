export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#121212]">{children}</div>;
}
