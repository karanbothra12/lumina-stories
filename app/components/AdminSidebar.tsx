'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User } from 'next-auth';
import Image from 'next/image';

interface AdminSidebarProps {
  user: User;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-lg font-bold text-zinc-900 flex items-center gap-2 font-serif">
           Lumina 
           <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 font-sans">Dashboard</span>
        </Link>
        <button  
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-md"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:h-screen md:flex md:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-6 h-full flex flex-col">
             <div className="mb-8 hidden md:block">
                 <Link href="/" className="text-xl font-bold text-zinc-900 flex items-center gap-2 font-serif">
                    Lumina 
                    <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 font-sans">Dashboard</span>
                 </Link>
             </div>

             <nav className="flex-1 space-y-1">
                <Link 
                    href="/admin" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/admin') ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    Your Stories
                </Link>
                 <Link 
                    href="/admin/blogs/new" 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/admin/blogs/new') ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Write new
                </Link>
                
                {/* @ts-ignore - Check if user is admin */}
                {user.role === 'ADMIN' && (
                    <Link 
                        href="/admin/users" 
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/admin/users') ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                        Users
                    </Link>
                )}
             </nav>

             <div className="border-t border-zinc-100 pt-4 mt-auto">
                 <div className="flex items-center gap-3">
                     <div className="relative w-8 h-8 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                         {user.image ? (
                             <Image 
                               src={user.image} 
                               alt={user.name || "User"}
                               fill
                               sizes="32px"
                               className="object-cover"
                             />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">{user.name?.[0] || 'U'}</div>
                         )}
                     </div>
                     <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                         <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                     </div>
                 </div>
             </div>
         </div>
      </aside>
    </>
  );
}

