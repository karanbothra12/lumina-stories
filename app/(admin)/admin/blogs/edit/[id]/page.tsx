import { prisma } from '@/lib/prisma';
import { BlogEditor } from '@/app/components/BlogEditor';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) redirect('/login');

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!blog) {
    notFound();
  }

  // Security check: Only author or ADMIN can edit
  if (blog.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-zinc-600">You do not have permission to edit this story.</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Edit story</h1>
      {/* Key ensures component remounts if navigating between blogs */}
      <BlogEditor key={blog.id} initialData={blog} isEditing />
    </div>
  );
}
