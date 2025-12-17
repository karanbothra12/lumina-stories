import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { RoleSelector } from '@/app/components/RoleSelector';

export default async function UsersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== Role.ADMIN) {
    redirect('/admin');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { blogs: true }
      }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Manage Users</h1>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Blogs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-zinc-900">{user.name || 'No Name'}</div>
                    <div className="text-sm text-zinc-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleSelector 
                        userId={user.id} 
                        initialRole={user.role} 
                        currentUserRole={session.user.role} 
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {user._count.blogs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* Prevent self-deactivation */}
                    {user.id !== session.user.id && (
                        <form action={async () => {
                            'use server';
                            const s = await auth();
                            if (s?.user.role === Role.ADMIN) {
                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: { isActive: !user.isActive }
                                });
                                revalidatePath('/admin/users');
                            }
                        }}>
                            <button 
                                className={`text-xs font-bold uppercase tracking-wide ${
                                    user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                }`}
                            >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
