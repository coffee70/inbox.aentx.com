import { withAuth } from "next-auth/middleware";

const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.email?.toLowerCase() === adminEmail,
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/submissions/:path*", "/settings/:path*", "/api/admin/:path*"],
};
