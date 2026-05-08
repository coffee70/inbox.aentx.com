import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { isSameOrigin } from "@/lib/security";
import { setAdminPassword, verifyAdminPassword } from "@/lib/admin-password";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PATCH(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = guard.session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const validCurrent = await verifyAdminPassword(email, parsed.data.currentPassword);
  if (!validCurrent) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await setAdminPassword(email, parsed.data.newPassword);
  return NextResponse.json({ ok: true });
}
