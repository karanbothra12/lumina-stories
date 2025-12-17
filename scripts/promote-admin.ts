import { prisma } from '@/lib/prisma';

async function promoteToAdmin() {
  const email = 'karanbothra12@gmail.com';
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully promoted ${user.email} to ADMIN.`);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();

