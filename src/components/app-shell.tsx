import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/submissions", label: "Submissions" },
  { href: "/settings", label: "Settings" },
];

export async function AppShell({
  children,
  currentPath = "/submissions",
}: {
  children: React.ReactNode;
  currentPath?: string;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/aentx-logo.png" alt="Aentx logo" width={36} height={36} priority />
            <div className="space-y-0.5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aentx</p>
              <p className="text-sm font-semibold">Inbox</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const active =
                currentPath === item.href ||
                (item.href === "/submissions" && currentPath.startsWith("/submissions/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-6 text-xs text-muted-foreground">
        Signed in as {session?.user?.email ?? "unknown"}
      </footer>
    </div>
  );
}
