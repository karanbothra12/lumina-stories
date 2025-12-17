import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/app/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      <AdminSidebar user={session.user} />
      
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
              {children}
          </div>
      </main>
    </div>
  );
}
