import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LibraryView } from '@/app/components/LibraryView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Library | Lumina',
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-8">Your Library</h1>
      <LibraryView />
    </div>
  );
}

