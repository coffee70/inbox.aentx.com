import { describe, expect, it } from "vitest";
import { publicSubmissionSchema } from "@/lib/validators/submission";

describe("publicSubmissionSchema", () => {
  it("accepts valid payloads", () => {
    const parsed = publicSubmissionSchema.safeParse({
      email: "admin@aentx.com",
      name: "Test User",
      honeypot: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid honeypot", () => {
    const parsed = publicSubmissionSchema.safeParse({
      email: "admin@aentx.com",
      honeypot: "filled",
    });
    expect(parsed.success).toBe(false);
  });
});
