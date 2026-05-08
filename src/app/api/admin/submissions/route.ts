import { NextRequest, NextResponse } from "next/server";
import { listSubmissions } from "@/server/submissions";
import { requireAdminApi } from "@/lib/admin-api-auth";

export async function GET(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? undefined;
  const status = (searchParams.get("status") ?? "ALL") as
    | "ALL"
    | "NEW"
    | "REVIEWED"
    | "CONTACTED"
    | "ARCHIVED"
    | "SPAM";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const result = await listSubmissions({ q, status, page, pageSize });
  return NextResponse.json(result);
}
