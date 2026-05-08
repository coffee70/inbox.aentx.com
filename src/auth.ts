import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { isAdminEmail } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-password";

const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password || !adminEmail || !isAdminEmail(email)) return null;

        const requestHeaders = (request as { headers?: unknown } | undefined)?.headers;
        const forwarded =
          typeof (requestHeaders as { get?: unknown })?.get === "function"
            ? (requestHeaders as { get: (name: string) => string | null }).get(
                "x-forwarded-for",
              )
            : (requestHeaders as Record<string, string | undefined> | undefined)?.[
                "x-forwarded-for"
              ];
        const ipKey = forwarded?.split(",")[0]?.trim() ?? "unknown";
        const rateLimit = await checkLoginRateLimit(ipKey, email);
        if (!rateLimit.success) return null;

        const validPassword = await verifyAdminPassword(email, password);
        if (!validPassword) return null;
        return { id: email, email, name: "Aentx Admin" };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.email) token.email = user.email.toLowerCase();
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.email && session.user) {
        session.user.email = token.email;
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);
export default NextAuth(authOptions);
