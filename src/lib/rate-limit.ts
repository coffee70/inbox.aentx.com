import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createLimiter(limit: number, window: `${number} s` | `${number} m` | `${number} h` | `${number} d`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "inbox",
  });
}

const submissionWindow = createLimiter(5, "10 m");
const submissionDay = createLimiter(20, "1 d");
const loginIpWindow = createLimiter(5, "15 m");
const loginEmailWindow = createLimiter(10, "1 h");

export async function checkPublicSubmissionRateLimit(ipKey: string) {
  if (!submissionWindow || !submissionDay) return { success: true };
  const [windowResult, dayResult] = await Promise.all([
    submissionWindow.limit(`submission:window:${ipKey}`),
    submissionDay.limit(`submission:day:${ipKey}`),
  ]);
  return { success: windowResult.success && dayResult.success };
}

export async function checkLoginRateLimit(ipKey: string, email: string) {
  if (!loginIpWindow || !loginEmailWindow) return { success: true };
  const [ipResult, emailResult] = await Promise.all([
    loginIpWindow.limit(`login:ip:${ipKey}`),
    loginEmailWindow.limit(`login:email:${email.toLowerCase()}`),
  ]);
  return { success: ipResult.success && emailResult.success };
}

export function hasRateLimitConfigured() {
  return Boolean(redis);
}
