import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("admin auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("ADMIN_EMAIL", "admin@aentx.com");
  });

  it("matches admin email case-insensitively and trimmed", async () => {
    const { isAdminEmail } = await import("@/lib/admin-auth");
    expect(isAdminEmail("  Admin@Aentx.com ")).toBe(true);
    expect(isAdminEmail("user@aentx.com")).toBe(false);
  });

  it("requireAdmin redirects when session is missing", async () => {
    authMock.mockResolvedValueOnce(null);
    const { requireAdmin } = await import("@/lib/admin-auth");
    await requireAdmin();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("requireAdmin redirects when email is not admin", async () => {
    authMock.mockResolvedValueOnce({ user: { email: "user@aentx.com" } });
    const { requireAdmin } = await import("@/lib/admin-auth");
    await requireAdmin();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("requireAdmin returns session for admin email", async () => {
    const session = { user: { email: "ADMIN@aentx.com " } };
    authMock.mockResolvedValueOnce(session);
    const { requireAdmin } = await import("@/lib/admin-auth");
    await expect(requireAdmin()).resolves.toEqual(session);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
