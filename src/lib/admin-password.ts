import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordCheck } from "@/lib/password-check";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function verifyAdminPassword(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  try {
    const credential = await prisma.adminCredential.findUnique({
      where: { email: normalizedEmail },
    });
    if (credential?.passwordHash) {
      return compare(password, credential.passwordHash);
    }
  } catch {
    // Fallback to env-based auth when DB credentials are unavailable.
  }

  return passwordCheck(password);
}

export async function setAdminPassword(email: string, nextPassword: string) {
  const normalizedEmail = normalizeEmail(email);
  const nextHash = await hash(nextPassword, 12);
  await prisma.adminCredential.upsert({
    where: { email: normalizedEmail },
    update: { passwordHash: nextHash },
    create: { email: normalizedEmail, passwordHash: nextHash },
  });
}
