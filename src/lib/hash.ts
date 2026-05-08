import { createHash } from "node:crypto";

export function hashIp(value: string | null) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex");
}
