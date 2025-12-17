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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.history.findMany({
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
        orderBy: { visitedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.history.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      history,
      pagination: {
        total,
        page,
        limit,
        hasMore: skip + history.length < total,
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
        // Silently fail for non-logged in users regarding history tracking
        // or return 200 to avoid client errors
      return NextResponse.json({ recorded: false }, { status: 200 });
    }

    const { blogId } = await request.json();
    if (!blogId) {
      return NextResponse.json({ message: 'Blog ID required' }, { status: 400 });
    }

    // Upsert: Create if new, update visitedAt if exists
    await prisma.history.upsert({
      where: {
        userId_blogId: {
          userId: session.user.id,
          blogId,
        },
      },
      update: {
        visitedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        blogId,
      },
    });

    return NextResponse.json({ recorded: true });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}

