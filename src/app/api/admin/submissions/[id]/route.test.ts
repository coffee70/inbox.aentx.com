import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
const requireAdminApiMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactSubmission: {
      findUnique: findUniqueMock,
      update: updateMock,
      delete: deleteMock,
    },
  },
}));

vi.mock("@/lib/admin-api-auth", () => ({
  requireAdminApi: requireAdminApiMock,
}));

function adminGuard() {
  return { session: { user: { email: "admin@aentx.com" } }, response: null };
}

describe("/api/admin/submissions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 if unauthenticated", async () => {
    requireAdminApiMock.mockResolvedValueOnce({
      session: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    });
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "GET",
    });
    const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(401);
  });

  it("GET returns 403 if authenticated non-admin", async () => {
    requireAdminApiMock.mockResolvedValueOnce({
      session: null,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    });
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "GET",
    });
    const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(403);
  });

  it("GET works for admin without Origin header", async () => {
    requireAdminApiMock.mockResolvedValueOnce(adminGuard());
    findUniqueMock.mockResolvedValueOnce({ id: "abc", email: "x@example.com" });
    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "GET",
      headers: { host: "localhost:3000" },
    });
    const response = await GET(request, { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(200);
  });

  it("PATCH returns 403 for admin when Origin is missing", async () => {
    requireAdminApiMock.mockResolvedValueOnce(adminGuard());
    const { PATCH } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "PATCH",
      headers: { "content-type": "application/json", host: "localhost:3000" },
      body: JSON.stringify({ status: "REVIEWED" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(403);
  });

  it("PATCH works for admin with same-origin request", async () => {
    requireAdminApiMock.mockResolvedValueOnce(adminGuard());
    updateMock.mockResolvedValueOnce({ id: "abc", status: "REVIEWED" });
    const { PATCH } = await import("./route");
    const request = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ status: "REVIEWED" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(200);
  });

  it("DELETE requires admin and same-origin", async () => {
    requireAdminApiMock.mockResolvedValueOnce(adminGuard());
    const { DELETE } = await import("./route");
    const missingOriginReq = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "DELETE",
      headers: { host: "localhost:3000" },
    });
    const denied = await DELETE(missingOriginReq, { params: Promise.resolve({ id: "abc" }) });
    expect(denied.status).toBe(403);

    requireAdminApiMock.mockResolvedValueOnce(adminGuard());
    deleteMock.mockResolvedValueOnce({ id: "abc" });
    const allowedReq = new NextRequest("http://localhost:3000/api/admin/submissions/abc", {
      method: "DELETE",
      headers: { host: "localhost:3000", origin: "http://localhost:3000" },
    });
    const allowed = await DELETE(allowedReq, { params: Promise.resolve({ id: "abc" }) });
    expect(allowed.status).toBe(200);
  });
});
