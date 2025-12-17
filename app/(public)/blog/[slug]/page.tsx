import { getBaseUrl } from '@/lib/url';
import { notFound } from 'next/navigation';
import { BlogInteractions } from '@/app/components/BlogInteractions';
import { BlogContent } from '@/app/components/BlogContent';
import { HistoryTracker } from '@/app/components/HistoryTracker';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

async function getBlog(slug: string) {
  const res = await fetch(`${getBaseUrl()}/api/blogs?slug=${slug}`, {
    next: {
      tags: [`blog:${slug}`],
      revalidate: 30,
    },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch blog');
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found',
    };
  }

  return {
    title: blog.title,
    description: `Read ${blog.title} on Lumina`,
    openGraph: {
        title: blog.title,
        description: `Read ${blog.title} on Lumina`,
        type: 'article',
        authors: [blog.author.name || 'Anonymous'],
        images: blog.coverImage ? [blog.coverImage] : undefined,
    }
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <HistoryTracker blogId={blog.id} />
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 mb-6 leading-tight">
          {blog.title}
        </h1>
        
        <div className="flex items-center gap-3 mb-8">
            <div className="relative w-10 h-10 rounded-full bg-zinc-200 overflow-hidden">
                {blog.author.image ? (
                    <Image 
                      src={blog.author.image} 
                      alt={blog.author.name || "Author"} 
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">
                        {blog.author.name?.[0] || 'A'}
                    </div>
                )}
            </div>
            <div>
                <div className="text-zinc-900 font-medium">
                    {blog.author.name || 'Anonymous'}
                </div>
                <div className="text-zinc-500 text-sm">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    })} · 5 min read
                </div>
            </div>
        </div>
      </div>

      {blog.coverImage && (
          <div className="relative mb-10 rounded-lg overflow-hidden w-full h-[300px] md:h-[400px]">
              <Image 
                src={blog.coverImage} 
                alt={blog.title} 
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
              />
          </div>
      )}

      <div className="prose prose-lg prose-zinc max-w-none mb-12">
        <BlogContent content={blog.content} />
      </div>

      <div className="mb-8">
        <div className="flex gap-2 mb-8">
            {blog.tags?.map((tag: any) => (
                <Link key={tag.id} href={`/tag/${tag.name}`} className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full text-sm hover:bg-zinc-200 transition-colors">
                    {tag.name}
                </Link>
            ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-8">
        <BlogInteractions blogId={blog.id} initialLikes={blog._count.likes} blogAuthorId={blog.authorId} />
      </div>
    </article>
  );
}
