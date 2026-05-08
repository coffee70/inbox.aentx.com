import { describe, expect, it, vi } from "vitest";

describe("cors", () => {
  it("allows configured origin", async () => {
    vi.stubEnv("PUBLIC_FORM_ALLOWED_ORIGINS", "https://aentx.com,http://localhost:3001");
    vi.resetModules();
    const cors = await import("@/lib/cors");
    expect(cors.isAllowedOrigin("https://aentx.com")).toBe(true);
  });

  it("rejects unknown origin", async () => {
    vi.stubEnv("PUBLIC_FORM_ALLOWED_ORIGINS", "https://aentx.com");
    vi.resetModules();
    const cors = await import("@/lib/cors");
    expect(cors.isAllowedOrigin("https://evil.example")).toBe(false);
    vi.unstubAllEnvs();
  });
});
