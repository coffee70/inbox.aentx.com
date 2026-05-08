import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { SubmissionDetail } from "@/components/submission-detail";
import { DatabaseNotConfigured } from "@/components/database-not-configured";
import { requireAdmin } from "@/lib/admin-auth";

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  if (!process.env.DATABASE_URL) {
    return (
      <AppShell currentPath="/submissions">
        <DatabaseNotConfigured />
      </AppShell>
    );
  }

  const { id } = await params;
  const submission = await prisma.contactSubmission.findUnique({ where: { id } });
  if (!submission) notFound();

  return (
    <AppShell currentPath="/submissions">
      <SubmissionDetail submission={submission} />
    </AppShell>
  );
}
