import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MAINTAINER', 'VIEWER']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    
    // Only ADMIN can change roles
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const result = roleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const { role } = result.data;

    // Prevent changing own role (to allow easy testing, I'll allow it but warn, usually bad practice but requested "SuperAdmin will have write to give access to anyone")
    // Let's prevent self-demotion from ADMIN to avoid locking out.
    if (id === session.user.id && role !== Role.ADMIN) {
         return NextResponse.json({ message: 'Cannot demote yourself' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating role' }, { status: 500 });
  }
}

