import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Check status for single blog
    if (blogId) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_blogId: {
            userId: session.user.id,
            blogId,
          },
        },
      });
      return NextResponse.json({ isBookmarked: !!bookmark });
    }

    // List all bookmarks
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: session.user.id },
        include: {
          blog: {
            include: {
              author: { select: { name: true, image: true } },
              tags: true,
              _count: { select: { likes: true, comments: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.bookmark.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      bookmarks,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + bookmarks.length < total,
      },
    });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { blogId } = await request.json();
    if (!blogId) {
      return NextResponse.json({ message: 'Blog ID required' }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_blogId: {
          userId: session.user.id,
          blogId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isBookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          blogId,
        },
      });
      return NextResponse.json({ isBookmarked: true });
    }

  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

