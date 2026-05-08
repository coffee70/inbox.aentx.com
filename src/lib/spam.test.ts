import { describe, expect, it } from "vitest";
import { scoreSubmissionSpam } from "@/lib/spam";

describe("scoreSubmissionSpam", () => {
  it("scores honeypot as high spam", () => {
    const result = scoreSubmissionSpam({ honeypot: "bot", userAgent: "test" });
    expect(result.score).toBeGreaterThanOrEqual(5);
  });

  it("scores a normal message as low spam", () => {
    const result = scoreSubmissionSpam({
      message: "I want to learn more about your services.",
      userAgent: "Mozilla/5.0",
      recentSameEmailCount: 0,
    });
    expect(result.score).toBeLessThan(5);
  });
});
