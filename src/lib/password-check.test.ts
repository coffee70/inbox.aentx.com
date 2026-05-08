import { beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { passwordCheck } from "@/lib/password-check";

describe("passwordCheck", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects plaintext password in production when hash is absent", async () => {
    const result = await passwordCheck("changeme", {
      adminPassword: "changeme",
      adminPasswordHash: "",
      nodeEnv: "production",
    });
    expect(result).toBe(false);
  });

  it("accepts plaintext password in non-production", async () => {
    const result = await passwordCheck("changeme", {
      adminPassword: "changeme",
      adminPasswordHash: "",
      nodeEnv: "development",
    });
    expect(result).toBe(true);
  });

  it("accepts hash-based password when configured", async () => {
    const hashed = await hash("supersecret", 4);
    const result = await passwordCheck("supersecret", {
      adminPasswordHash: hashed,
      nodeEnv: "production",
    });
    expect(result).toBe(true);
  });
});
