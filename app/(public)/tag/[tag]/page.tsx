import { getBaseUrl } from '@/lib/url';
import Link from 'next/link';

async function getBlogsByTag(tag: string) {
  const res = await fetch(`${getBaseUrl()}api/blogs?tag=${tag}`, {
    next: {
      tags: [`tag:${tag}`, 'blogs'], // Revalidate if tag page specific or general list changes? Prompt says "All associated tag:{tagName}" on update.
      revalidate: 60,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blogs');
  }

  return res.json();
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodeTag = decodeURIComponent(tag);
  const blogs = await getBlogsByTag(decodeTag);
 
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="border-b border-zinc-200 pb-8 mb-8">
        <h1 className="text-4xl font-serif font-bold text-zinc-900 mb-4">
           {decodeTag}
        </h1>
        <p className="text-zinc-500">
           {blogs.blogs.length} stories
        </p>
      </div>

      <div className="space-y-10">
        {blogs.blogs.map((blog: any) => (
            <article key={blog.id} className="flex flex-col gap-2 group cursor-pointer">
            <Link href={`/blog/${blog.slug}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden">
                   {blog.author.image ? (
                       <img src={blog.author.image} alt="" className="w-full h-full object-cover"/>
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                           {blog.author.name?.[0] || 'A'}
                       </div>
                   )}
                </div>
                <span className="text-sm font-medium text-zinc-900">{blog.author.name || 'Anonymous'}</span>
                <span className="text-sm text-zinc-500">·</span>
                <span className="text-sm text-zinc-500">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-zinc-900 mb-2 group-hover:underline decoration-zinc-900 decoration-2 underline-offset-2">
                {blog.title}
              </h2>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex gap-2">
                    {blog.tags.map((t: any) => (
                        <span key={t.id} className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full text-xs font-medium">
                            {t.name}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-zinc-400">
                    {blog._count.likes} likes · {blog._count.comments} comments
                </span>
              </div>
            </Link>
          </article>
        ))}
         
         {blogs.blogs.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
                No stories found for this tag.
            </div>
         )}
      </div>
    </div>
  );
}

