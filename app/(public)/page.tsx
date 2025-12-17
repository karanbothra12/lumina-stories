import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Blog, Tag } from '@prisma/client';
import { BlogFeed } from '@/app/components/BlogFeed';
import { auth } from '@/lib/auth';

type BlogWithAuthorAndTags = Blog & {
  author: { name: string | null; image: string | null };
  tags: Tag[];
  _count: { likes: number; comments: number };
};

// Response type from API
type BlogsResponse = {
    blogs: BlogWithAuthorAndTags[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }
};

async function getInitialBlogs() {
  const page = 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
            author: { select: { name: true, image: true } },
            tags: true,
            _count: { select: { likes: true, comments: true } },
        },
    }),
    prisma.blog.count({ where: { published: true } })
  ]);

  return {
      blogs,
      pagination: {
          total,
          page,
          limit,
          hasMore: skip + blogs.length < total
      }
  };
}

export default async function HomePage() {
  const [data, session] = await Promise.all([getInitialBlogs(), auth()]);
  const startWritingHref = session?.user ? '/admin/blogs/new' : '/login';

  return (
    <div>
      <section className="bg-zinc-50 border-b border-zinc-100 py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-zinc-900 mb-6 tracking-tight leading-tight">
                Stories that matter.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                Discover new perspectives, deep dives, and expert knowledge on topics you love.
            </p>
            <div className="flex justify-center gap-4">
                 <Link href={startWritingHref} className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    Start Writing
                 </Link>
                 <Link href="#reading-list" className="bg-white text-zinc-900 border border-zinc-200 px-8 py-3 rounded-full font-medium hover:border-zinc-900 transition-colors text-lg">
                    Start Reading
                 </Link>
            </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16" id="reading-list">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1 max-w-4xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-10">
               <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-zinc-900 rounded-full"></span>
                  Trending Now
               </h2>
            </div>
            
            <BlogFeed initialBlogs={data.blogs} initialHasMore={data.pagination.hasMore} />
          </div>
          
          <aside className="hidden md:block w-80 shrink-0">
              <div className="sticky top-24 space-y-10">
                  <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100">
                      <h3 className="font-bold text-zinc-900 mb-4 text-lg">Discover Topics</h3>
                      <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(data.blogs.flatMap(b => b.tags.map(t => t.name)))).slice(0, 10).map(tag => (
                              <Link key={tag} href={`/tag/${tag}`} className="bg-white border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-full text-sm hover:border-zinc-900 hover:text-zinc-900 transition-colors">
                                  {tag}
                              </Link>
                          ))}
                          {data.blogs.length === 0 && <span className="text-zinc-400 text-sm">No topics yet</span>}
                      </div>
                  </div>

                  <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <h3 className="font-bold text-zinc-900 mb-2">Write on Lumina</h3>
                      <p className="text-zinc-600 mb-4 text-sm leading-relaxed">
                          Share your voice with a growing community of readers and thinkers.
                      </p>
                      <Link href={startWritingHref} className="text-zinc-900 font-medium hover:underline text-sm">
                          Start writing →
                      </Link>
                  </div>
              </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
