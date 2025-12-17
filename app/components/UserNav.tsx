'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { User } from 'next-auth';
import Image from 'next/image';

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="relative w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-sm font-medium text-zinc-600 overflow-hidden">
            {user.image ? (
                <Image 
                  src={user.image} 
                  alt={user.name || "User"} 
                  fill
                  sizes="32px"
                  className="object-cover" 
                />
            ) : (
                user.name?.[0]?.toUpperCase() || "U"
            )}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-md shadow-lg py-1 z-20">
            <div className="px-4 py-2 border-b border-zinc-100">
              <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            
            <Link 
                href="/admin" 
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => setIsOpen(false)}
              >
                My Stories
              </Link>
            
            <Link 
                href="/library" 
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={() => setIsOpen(false)}
              >
                Library
              </Link>
            
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-50"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

