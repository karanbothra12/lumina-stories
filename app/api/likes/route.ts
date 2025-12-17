import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const likeSchema = z.object({
  blogId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = likeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const { blogId } = result.data;
    const userId = session.user.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_blogId: {
            userId,
            blogId,
          },
        },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          blogId,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error toggling like' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const session = await auth();

    if (!blogId) {
        return NextResponse.json({ message: 'Missing blogId' }, { status: 400 });
    }

    try {
        const count = await prisma.like.count({
            where: { blogId },
        });

        let userLiked = false;
        if (session?.user?.id) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_blogId: {
                        userId: session.user.id,
                        blogId,
                    }
                }
            });
            userLiked = !!like;
        }

        return NextResponse.json({ count, userLiked });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching likes' }, { status: 500 });
    }
}

