const spamTerms = [
  "crypto",
  "casino",
  "seo service",
  "buy now",
  "backlink",
  "whatsapp",
];

export function scoreSubmissionSpam(input: {
  honeypot?: string;
  message?: string;
  userAgent?: string | null;
  recentSameEmailCount?: number;
}) {
  const reasons: string[] = [];
  let score = 0;
  const message = input.message?.toLowerCase() ?? "";

  if (input.honeypot) {
    score += 5;
    reasons.push("honeypot-filled");
  }

  const linkCount = (message.match(/https?:\/\//g) ?? []).length;
  if (linkCount >= 3) {
    score += 3;
    reasons.push("too-many-links");
  }

  if (!input.userAgent?.trim()) {
    score += 2;
    reasons.push("missing-user-agent");
  }

  if ((input.recentSameEmailCount ?? 0) >= 2) {
    score += 2;
    reasons.push("recent-duplicate-email");
  }

  if (spamTerms.some((term) => message.includes(term))) {
    score += 1;
    reasons.push("suspicious-keywords");
  }

  return { score, reasons };
}
