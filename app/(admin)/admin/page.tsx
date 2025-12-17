import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { page } = await searchParams;
  const currentPage = parseInt(page || '1');
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const isAdmin = session.user.role === Role.ADMIN;

  const where = isAdmin ? {} : { authorId: session.user.id };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
        author: { select: { name: true, email: true } },
        _count: { select: { likes: true, comments: true } },
        },
    }),
    prisma.blog.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
            <h1 className="text-2xl font-bold text-zinc-900">
                {isAdmin ? 'All Stories (Super Admin)' : 'Your Stories'}
            </h1>
            {isAdmin && <p className="text-zinc-500 text-sm mt-1">Manage content across the platform</p>}
        </div>
        <Link href="/admin/blogs/new" className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800">
            Write new
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-zinc-200">
           <h3 className="text-lg font-medium text-zinc-900 mb-2">No stories yet</h3>
           <p className="text-zinc-500 mb-6">Start writing your first blog post today.</p>
           <Link href="/admin/blogs/new" className="text-zinc-900 underline hover:no-underline">
               Write a story
           </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                        {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Author</th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stats</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                    {blogs.map((blog) => (
                        <tr key={blog.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-zinc-900 max-w-[200px] md:max-w-xs truncate">{blog.title}</div>
                                <div className="text-sm text-zinc-500 truncate max-w-[150px]">{blog.slug}</div>
                            </td>
                            {isAdmin && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-zinc-900">{blog.author.name || 'Unknown'}</div>
                                    <div className="text-xs text-zinc-500">{blog.author.email}</div>
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.published ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'}`}>
                                    {blog.published ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {blog._count.likes} likes, {blog._count.comments} comments
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {new Date(blog.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <form action={async () => {
                                    'use server';
                                    const b = await prisma.blog.findUnique({ where: { id: blog.id } });
                                    const s = await auth();
                                    const isAdm = s?.user?.role === 'ADMIN';
                                    
                                    if (b && s && (b.authorId === s.user.id || isAdm)) {
                                        const updated = await prisma.blog.update({
                                            where: { id: blog.id },
                                            data: { published: !b.published }
                                        });
                                        revalidateTag('blogs', 'default');
                                        revalidateTag(`blog:${updated.slug}`, 'default');
                                    }
                                }} className="inline-block">
                                    <button className="text-zinc-600 hover:text-zinc-900 mr-4 text-xs uppercase tracking-wide">
                                        {blog.published ? 'Unpublish' : 'Publish'}
                                    </button>
                                </form>
                                
                                <Link href={`/admin/blogs/edit/${blog.id}`} className="text-zinc-600 hover:text-zinc-900 mr-4">Edit</Link>
                                
                                {isAdmin && (
                                    <form action={async () => {
                                        'use server';
                                        const b = await prisma.blog.findUnique({ where: { id: blog.id } });
                                        const s = await auth();
                                        const isAdm = s?.user?.role === 'ADMIN';

                                    if (isAdm && b) {
                                        await prisma.blog.delete({ where: { id: blog.id } });
                                        revalidateTag('blogs', 'default');
                                        revalidateTag(`blog:${b.slug}`, 'default');
                                    }
                                    }} className="inline-block ml-4">
                                         <button className="text-red-600 hover:text-red-900 text-xs uppercase tracking-wide">
                                            Delete
                                        </button>
                                    </form>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
          
          {/* Admin Pagination Controls */}
          {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-zinc-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                          <p className="text-sm text-zinc-700">
                              Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                          </p>
                      </div>
                      <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              {currentPage > 1 && (
                                  <Link href={`/admin?page=${currentPage - 1}`} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-zinc-300 bg-white text-sm font-medium text-zinc-500 hover:bg-zinc-50">
                                      Previous
                                  </Link>
                              )}
                              {currentPage < totalPages && (
                                  <Link href={`/admin?page=${currentPage + 1}`} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-zinc-300 bg-white text-sm font-medium text-zinc-500 hover:bg-zinc-50">
                                      Next
                                  </Link>
                              )}
                          </nav>
                      </div>
                  </div>
                  {/* Mobile Simple Nav */}
                  <div className="flex items-center justify-between w-full sm:hidden">
                       <Link 
                          href={currentPage > 1 ? `/admin?page=${currentPage - 1}` : '#'} 
                          className={`flex items-center justify-center px-4 py-2 border border-zinc-300 text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                       >
                           Previous
                       </Link>
                       <Link 
                          href={currentPage < totalPages ? `/admin?page=${currentPage + 1}` : '#'} 
                          className={`ml-3 flex items-center justify-center px-4 py-2 border border-zinc-300 text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                       >
                           Next
                       </Link>
                  </div>
              </div>
          )}
        </div>
      )}
    </div>
  );
}
