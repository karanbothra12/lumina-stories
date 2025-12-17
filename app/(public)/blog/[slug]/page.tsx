import { getBaseUrl } from '@/lib/url';
import { notFound } from 'next/navigation';
import { BlogInteractions } from '@/app/components/BlogInteractions';
import { BlogContent } from '@/app/components/BlogContent';
import { HistoryTracker } from '@/app/components/HistoryTracker';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Suspense } from 'react';

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
    title: blog.seoTitle || blog.title,
    description: blog.seoDescription || `Read ${blog.title} on Lumina`,
    keywords: blog.seoKeywords ? blog.seoKeywords.split(',').map((k: any) => k.trim()) : undefined,
    alternates: {
      canonical: `${getBaseUrl()}/blog/${blog.slug}`,
    },
    openGraph: {
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || `Read ${blog.title} on Lumina`,
        type: 'article',
        url: `${getBaseUrl()}/blog/${blog.slug}`,
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

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/blog/${blog.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.seoTitle || blog.title,
    description: blog.seoDescription || `Read ${blog.title} on Lumina`,
    image: blog.coverImage ? [blog.coverImage] : undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Person",
      name: blog.author?.name || "Anonymous",
    },
    publisher: {
      "@type": "Organization",
      name: "Lumina",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og-image.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: blog.seoKeywords,
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <HistoryTracker blogId={blog.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="grid gap-10 md:gap-16">
        <header className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <span>Published on</span>
              <span className="text-zinc-900">{new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-zinc-900 leading-tight">
              {blog.title}
            </h1>
            <p className="text-base md:text-lg text-zinc-500 max-w-3xl">
              {blog.seoDescription || 'In-depth perspective from the Lumina community.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full bg-zinc-200 overflow-hidden">
                {blog.author.image ? (
                  <Image
                    src={blog.author.image}
                    alt={blog.author.name || 'Author'}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-medium">
                    {blog.author.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-zinc-500">Written by</p>
                <p className="text-base font-medium text-zinc-900">
                  {blog.author.name || 'Anonymous'}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Reading time</p>
                <p className="text-base font-medium text-zinc-900">~5 min</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Published</p>
                <p className="text-base font-medium text-zinc-900">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {blog.coverImage && (
          <figure className="relative w-full h-[320px] md:h-[480px] rounded-3xl overflow-hidden border border-zinc-200 shadow-lg">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover"
            />
          </figure>
        )}

        <section className="prose prose-lg prose-zinc max-w-none prose-headings:font-serif prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-a:text-zinc-900">
          <BlogContent content={blog.content} />
        </section>

        <section className="border-y border-zinc-100 py-8 flex flex-wrap items-center gap-4 md:gap-6">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Tags</p>
          <div className="flex flex-wrap gap-3">
            {blog.tags?.map((tag: any) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.name}`}
                className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium hover:bg-zinc-900 hover:text-white transition-colors"
              >
                {tag.name}
              </Link>
            ))}
            {(!blog.tags || blog.tags.length === 0) && (
              <span className="text-sm text-zinc-400">No tags added</span>
            )}
          </div>
        </section>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50/60 p-6 shadow-sm">
          <Suspense fallback={<div className="text-sm text-zinc-500">Loading interactions...</div>}>
            <BlogInteractions blogId={blog.id} initialLikes={blog._count.likes} blogAuthorId={blog.authorId} />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
