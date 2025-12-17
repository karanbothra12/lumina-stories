import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

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

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { blog: { select: { authorId: true } } }
    });

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Allow Comment Author OR Admin OR Blog Author
    if (
        comment.userId !== session.user.id && 
        session.user.role !== Role.ADMIN && 
        comment.blog.authorId !== session.user.id
    ) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting comment' }, { status: 500 });
  }
}

