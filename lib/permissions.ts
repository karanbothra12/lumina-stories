import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  // @ts-ignore
  return user?.role === Role.ADMIN;
}

export async function requireAdmin() {
  const isAdm = await isAdmin();
  if (!isAdm) {
    throw new Error("Unauthorized: Admin access required");
  }
}

