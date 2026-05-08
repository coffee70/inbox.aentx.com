import { SubmissionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCaptcha } from "@/lib/captcha";
import { checkPublicSubmissionRateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/hash";
import { getClientIp } from "@/lib/security";
import { isAllowedOrigin, withPublicCors } from "@/lib/cors";
import { publicSubmissionSchema } from "@/lib/validators/submission";
import { scoreSubmissionSpam } from "@/lib/spam";

function failure(message: string, status: number, origin: string | null) {
  const response = NextResponse.json({ error: message }, { status });
  return origin && isAllowedOrigin(origin) ? withPublicCors(response, origin) : response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }
  return withPublicCors(new NextResponse(null, { status: 204 }), origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) return failure("Invalid submission", 403, origin);

  const payload = await request.json().catch(() => null);
  const parsed = publicSubmissionSchema.safeParse(payload);
  if (!parsed.success) return failure("Invalid submission", 400, origin);

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  const rateLimit = await checkPublicSubmissionRateLimit(ipHash ?? "unknown");
  if (!rateLimit.success) return failure("Too many requests", 429, origin);

  const captcha = await verifyCaptcha(parsed.data.captchaToken);
  if (!captcha.valid) return failure("Invalid submission", 400, origin);

  const recentCount = await prisma.contactSubmission.count({
    where: { email: parsed.data.email, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  const spam = scoreSubmissionSpam({
    honeypot: parsed.data.honeypot,
    message: parsed.data.message,
    userAgent: request.headers.get("user-agent"),
    recentSameEmailCount: recentCount,
  });

  await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company,
      role: parsed.data.role,
      website: parsed.data.website,
      interestType: parsed.data.interestType,
      message: parsed.data.message,
      source: "public-form",
      status: spam.score >= 5 ? SubmissionStatus.SPAM : SubmissionStatus.NEW,
      spamScore: spam.score,
      spamReasons: spam.reasons,
      ipHash,
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
      origin,
    },
  });

  return withPublicCors(NextResponse.json({ ok: true }, { status: 201 }), origin);
}
