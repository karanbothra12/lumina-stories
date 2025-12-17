import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, image: true } },
        tags: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching blog' }, { status: 500 });
  }
}

const updateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.any().optional(),
  slug: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  coverImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const blogCheck = await prisma.blog.findUnique({ where: { id } });
    if (!blogCheck) {
        return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    // Allow Author OR Admin
    if (blogCheck.authorId !== session.user.id && session.user.role !== Role.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = updateBlogSchema.safeParse(body);

    if (!result.success) {
      // Robust error handling for Zod v4/v3 differences
      let issues: any[] = [];
      const err: any = result.error;
      
      if (Array.isArray(err.errors)) {
        issues = err.errors;
      } else if (Array.isArray(err.issues)) {
        issues = err.issues;
      } else {
        try {
           issues = JSON.parse(err.message);
        } catch (e) {
           issues = [{ message: err.message, path: [] }];
        }
      }

      const mappedErrors = issues.map((issue: any) => ({
        field: issue.path ? issue.path.join('.') : 'unknown',
        message: issue.message,
      }));

      return NextResponse.json(
        {
          message: mappedErrors.map((e) => e.message).join('. '),
          errors: mappedErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, slug, tags, published, coverImage, seoTitle, seoDescription, seoKeywords } = result.data;

    const data: any = {
      ...(title && { title }),
      ...(content && { content }),
      ...(slug && { slug }),
      ...(published !== undefined && { published }),
      ...(coverImage !== undefined && { coverImage }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(seoKeywords !== undefined && { seoKeywords }),
    };

    if (tags) {
      data.tags = {
        set: [], // Clear existing relations
        connectOrCreate: tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      };
    }

    const oldBlog = await prisma.blog.findUnique({ where: { id }, include: { tags: true } });
    if (!oldBlog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

    const blog = await prisma.blog.update({
      where: { id },
      data,
      include: { tags: true },
    });

    revalidateTag('blogs', 'default');
    revalidateTag(`blog:${blog.slug}`, 'default');
    if (oldBlog.slug !== blog.slug) {
        revalidateTag(`blog:${oldBlog.slug}`, 'default');
    }
    
    const allTags = new Set([...oldBlog.tags.map(t => t.name), ...blog.tags.map(t => t.name)]);
    allTags.forEach(tag => revalidateTag(`tag:${tag}`, 'default'));

    return NextResponse.json(blog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating blog' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const blogCheck = await prisma.blog.findUnique({ where: { id } });
    if (!blogCheck) {
        return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    // Allow Author OR Admin
    if (blogCheck.authorId !== session.user.id && session.user.role !== Role.ADMIN) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const blog = await prisma.blog.delete({
      where: { id },
      include: { tags: true }
    });

    revalidateTag('blogs', 'default');
    revalidateTag(`blog:${blog.slug}`, 'default');
    blog.tags.forEach(t => revalidateTag(`tag:${t.name}`, 'default'));

    return NextResponse.json({ message: 'Blog deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting blog' }, { status: 500 });
  }
}
