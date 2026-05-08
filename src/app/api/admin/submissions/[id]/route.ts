import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminSubmissionPatchSchema } from "@/lib/validators/submission";
import { isSameOrigin } from "@/lib/security";
import { requireAdminApi } from "@/lib/admin-api-auth";

async function checkAccess(
  request: NextRequest,
  options?: { requireSameOrigin?: boolean },
) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;
  if (options?.requireSameOrigin && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAccess(request);
  if (guard) return guard;
  const { id } = await params;
  const item = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAccess(request, { requireSameOrigin: true });
  if (guard) return guard;
  const body = await request.json().catch(() => null);
  const parsed = adminSubmissionPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id } = await params;

  const updated = await prisma.contactSubmission.update({
    where: { id },
    data: {
      ...parsed.data,
      reviewedAt: parsed.data.status === "REVIEWED" ? new Date() : undefined,
      archivedAt: parsed.data.status
        ? parsed.data.status === "ARCHIVED"
          ? new Date()
          : null
        : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await checkAccess(request, { requireSameOrigin: true });
  if (guard) return guard;
  const { id } = await params;
  await prisma.contactSubmission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
