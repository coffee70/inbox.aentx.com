import { compare } from "bcryptjs";

export async function passwordCheck(
  password: string,
  options: {
    adminPassword?: string;
    adminPasswordHash?: string;
    nodeEnv?: string;
  } = {},
) {
  const adminPassword = options.adminPassword ?? process.env.ADMIN_PASSWORD ?? "";
  const adminPasswordHash = options.adminPasswordHash ?? process.env.ADMIN_PASSWORD_HASH;
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV;

  if (adminPasswordHash) {
    return compare(password, adminPasswordHash);
  }

  if (nodeEnv !== "production" && adminPassword.length > 0) {
    return password === adminPassword;
  }

  return false;
}
