import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const slug = searchParams.get('slug');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '5');
  const skip = (page - 1) * limit;

  try {
    if (slug) {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
          author: {
            select: { name: true, image: true },
          },
          tags: true,
          _count: {
            select: { likes: true, comments: true },
          },
        },
      });
      
      if (!blog) {
         return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
      }
      return NextResponse.json(blog);
    }

    const where: any = {
      published: true,
    };

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: skip,
      include: {
        author: {
          select: { name: true, image: true },
        },
        tags: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const total = await prisma.blog.count({ where });

    return NextResponse.json({
        blogs,
        pagination: {
            total,
            page,
            limit,
            hasMore: skip + blogs.length < total
        }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blogs' }, { status: 500 });
  }
}

const createBlogSchema = z.object({
  title: z.string().min(1),
  content: z.any(), // JSON content
  slug: z.string().optional(),
  tags: z.array(z.string()),
  published: z.boolean().optional(),
  coverImage: z.string().optional(),
});

function generateSlug(title: string) {
  const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores
      .replace(/^-+|-+$/g, ''); // Trim dashes
  
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createBlogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const { title, content, tags, published, coverImage } = result.data;
    const slug = result.data.slug || generateSlug(title);

    const tagConnect = tags.map((name) => ({
      where: { name },
      create: { name },
    }));

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        slug,
        coverImage,
        published: published ?? false,
        authorId: session.user.id,
        tags: {
          connectOrCreate: tagConnect,
        },
      },
    });

    revalidateTag('blogs', 'default');
    tags.forEach((tag) => revalidateTag(`tag:${tag}`, 'default'));

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating blog' }, { status: 500 });
  }
}
