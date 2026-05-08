import { SubmissionStatus } from "@prisma/client";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listSubmissions } from "@/server/submissions";
import { SubmissionsTable } from "@/components/submissions-table";
import { DatabaseNotConfigured } from "@/components/database-not-configured";
import { requireAdmin } from "@/lib/admin-auth";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

export default async function SubmissionsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  if (!process.env.DATABASE_URL) {
    return (
      <AppShell currentPath="/submissions">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Submissions</h1>
          <DatabaseNotConfigured />
        </section>
      </AppShell>
    );
  }

  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = (params.status as SubmissionStatus | "ALL" | undefined) ?? "ALL";
  const page = Number(params.page ?? "1");
  const result = await listSubmissions({ q, status, page, pageSize: 20 });

  return (
    <AppShell currentPath="/submissions">
      <section className="space-y-5">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <form className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_220px_auto]">
          <Input name="q" defaultValue={q} placeholder="Search email, name, company..." />
          <Select name="status" defaultValue={status}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {["ALL", "NEW", "REVIEWED", "CONTACTED", "ARCHIVED", "SPAM"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Apply Filters</Button>
        </form>
        <SubmissionsTable items={result.items} />
        <div className="flex items-center justify-between text-sm">
          <p>
            Showing {result.items.length} of {result.total}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/submissions?q=${encodeURIComponent(q)}&status=${status}&page=${Math.max(result.page - 1, 1)}`}
              className="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-disabled={result.page <= 1}
            >
              Previous
            </Link>
            <Link
              href={`/submissions?q=${encodeURIComponent(q)}&status=${status}&page=${result.page + 1}`}
              className="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-disabled={result.page * result.pageSize >= result.total}
            >
              Next
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
