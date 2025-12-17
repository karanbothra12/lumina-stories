import Link from 'next/link';
import { auth } from '@/lib/auth';
import { UserNav } from './UserNav';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center font-serif font-bold rounded-lg group-hover:rotate-3 transition-transform">
             L
           </div>
           <span className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">Lumina</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
             <div className="flex items-center gap-4">
               <Link href="/login" className="text-zinc-500 hover:text-zinc-900 text-sm font-medium">
                 Sign in
               </Link>
               <Link 
                 href="/register" 
                 className="bg-zinc-900 text-zinc-50 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
               >
                 Get started
               </Link>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}

