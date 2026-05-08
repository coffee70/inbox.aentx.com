import { SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ListOptions = {
  q?: string;
  status?: SubmissionStatus | "ALL";
  page?: number;
  pageSize?: number;
};

export async function listSubmissions(options: ListOptions = {}) {
  const page = Math.max(options.page ?? 1, 1);
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100);
  const where = {
    ...(options.status && options.status !== "ALL" ? { status: options.status } : {}),
    ...(options.q
      ? {
          OR: [
            { email: { contains: options.q, mode: "insensitive" as const } },
            { name: { contains: options.q, mode: "insensitive" as const } },
            { company: { contains: options.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactSubmission.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getSubmissionById(id: string) {
  return prisma.contactSubmission.findUnique({ where: { id } });
}
