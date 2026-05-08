import { redirect } from "next/navigation";
import { auth } from "@/auth";

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return Boolean(adminEmail && email?.toLowerCase().trim() === adminEmail);
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    redirect("/login");
  }
  return session;
}
