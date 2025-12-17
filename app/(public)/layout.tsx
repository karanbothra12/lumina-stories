import { Header } from '@/app/components/Header';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header />
      <main>{children}</main>
    </div>
  );
}

