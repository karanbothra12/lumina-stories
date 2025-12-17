'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Blog, Tag } from '@prisma/client';
import { api } from '@/lib/api-client';
import Image from 'next/image';

type BlogWithAuthorAndTags = Blog & {
  author: { name: string | null; image: string | null };
  tags: Tag[];
  _count: { likes: number; comments: number };
};

interface BlogFeedProps {
  initialBlogs: BlogWithAuthorAndTags[];
  initialHasMore: boolean;
}

export function BlogFeed({ initialBlogs, initialHasMore }: BlogFeedProps) {
  const [blogs, setBlogs] = useState<BlogWithAuthorAndTags[]>(initialBlogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      // Using generic object for response since api-client types might be basic
      const data = await api.get<{ blogs: BlogWithAuthorAndTags[], pagination: any }>(`/api/blogs?page=${nextPage}&limit=5`);
      setBlogs([...blogs, ...data.blogs]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more blogs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {blogs.map((blog) => {
        // Extract preview text safely
        let previewText = "Read more...";
        if (blog.content && typeof blog.content === 'object' && (blog.content as any).blocks) {
            const firstParagraph = (blog.content as any).blocks.find((b: any) => b.type === 'paragraph');
            if (firstParagraph) {
                previewText = firstParagraph.data.text.replace(/<[^>]*>?/gm, ''); // Strip HTML if any
            }
        } else if (typeof blog.content === 'string') {
            previewText = blog.content;
        }

        return (
          <article key={blog.id} className="flex flex-col gap-6 group cursor-pointer border border-transparent hover:border-zinc-100 hover:bg-zinc-50/50 p-6 -mx-6 rounded-2xl transition-all duration-300">
            <Link href={`/blog/${blog.slug}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-8 h-8 rounded-full bg-zinc-200 overflow-hidden ring-2 ring-white shadow-sm">
                   {blog.author.image ? (
                       <Image 
                         src={blog.author.image} 
                         alt={blog.author.name || "Author"} 
                         fill
                         sizes="32px"
                         className="object-cover"
                       />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-medium">
                           {blog.author.name?.[0] || 'A'}
                       </div>
                   )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 leading-none">{blog.author.name || 'Anonymous'}</span>
                    <span className="text-xs text-zinc-500 mt-1">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric'
                        })}
                    </span>
                </div>
              </div>
              
              <div className="flex flex-col-reverse md:flex-row justify-between gap-8">
                <div className="flex-1 py-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 font-serif leading-tight group-hover:text-zinc-700 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-zinc-500 line-clamp-3 font-serif text-lg leading-relaxed mb-4">
                     {previewText}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="flex gap-2">
                        {blog.tags.map(tag => (
                            <span key={tag.id} className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full text-xs font-medium group-hover:bg-zinc-200 transition-colors">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">
                        {blog._count.likes} likes
                    </span>
                  </div>
                </div>
                
                {/* Thumbnail */}
                {blog.coverImage && (
                    <div className="relative w-full md:w-48 md:h-32 shrink-0 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                        <Image 
                          src={blog.coverImage} 
                          alt={blog.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, 192px"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                )}
              </div>
            </Link>
          </article>
        );
      })}
      
      {blogs.length === 0 && (
          <div className="py-20 text-center text-zinc-500">
              No blogs found.
          </div>
      )}

      {hasMore && (
        <div className="text-center pt-8">
            <button 
                onClick={loadMore} 
                disabled={loading}
                className="bg-white border border-zinc-200 text-zinc-600 px-6 py-2 rounded-full text-sm font-medium hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-50"
            >
                {loading ? 'Loading...' : 'Load more stories'}
            </button>
        </div>
      )}
    </div>
  );
}

