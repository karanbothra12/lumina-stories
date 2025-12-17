'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';

interface RoleSelectorProps {
  userId: string;
  initialRole: Role;
  currentUserRole: string; // To check if current user is ADMIN
}

export function RoleSelector({ userId, initialRole, currentUserRole }: RoleSelectorProps) {
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: Role) => {
    setLoading(true);
    setRole(newRole);

    try {
        const res = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });

        if (!res.ok) {
            throw new Error('Failed to update role');
        }
        
        router.refresh();
    } catch (error) {
        console.error(error);
        // Revert on error
        setRole(initialRole);
        alert('Failed to update role');
    } finally {
        setLoading(false);
    }
  };

  if (currentUserRole !== 'ADMIN') {
      return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
            {role}
        </span>
      );
  }

  return (
    <div className="relative">
      <select
        value={role}
        disabled={loading}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className={`block w-full pl-3 pr-8 py-1 text-xs font-semibold rounded-full border-gray-300 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-xs cursor-pointer ${
            loading ? 'opacity-50' : ''
        } ${
            role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-200' :
            role === 'MAINTAINER' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            role === 'VIEWER' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
        }`}
      >
        <option value="USER">USER</option>
        <option value="MAINTAINER">MAINTAINER</option>
        <option value="VIEWER">VIEWER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    </div>
  );
}

