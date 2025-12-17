import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');

  if (!blogId) {
    return NextResponse.json({ message: 'Missing blogId' }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { blogId },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching comments' }, { status: 500 });
  }
}

const commentSchema = z.object({
  blogId: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = commentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const { blogId, content } = result.data;

    const comment = await prisma.comment.create({
      data: {
        content,
        blogId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating comment' }, { status: 500 });
  }
}

