import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createMock = vi.fn();
const countMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactSubmission: {
      create: createMock,
      count: countMock,
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkPublicSubmissionRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/captcha", () => ({
  verifyCaptcha: vi.fn().mockResolvedValue({ valid: true }),
}));

describe("POST /api/public/submissions", () => {
  beforeEach(() => {
    createMock.mockReset();
    countMock.mockReset();
    countMock.mockResolvedValue(0);
    vi.stubEnv("PUBLIC_FORM_ALLOWED_ORIGINS", "https://aentx.com");
  });

  it("returns 403 for unknown origin", async () => {
    vi.resetModules();
    const { POST } = await import("./route");
    const request = new NextRequest("https://inbox.aentx.com/api/public/submissions", {
      method: "POST",
      headers: { origin: "https://evil.example", "content-type": "application/json" },
      body: JSON.stringify({ email: "test@aentx.com" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it("stores valid submissions", async () => {
    vi.resetModules();
    const { POST } = await import("./route");
    const request = new NextRequest("https://inbox.aentx.com/api/public/submissions", {
      method: "POST",
      headers: {
        origin: "https://aentx.com",
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      },
      body: JSON.stringify({ email: "test@aentx.com", honeypot: "" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledTimes(1);
  });
});
