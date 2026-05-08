import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { hasRateLimitConfigured } from "@/lib/rate-limit";
import { parseCsvEnv } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-auth";
import { ChangePasswordCard } from "@/app/settings/change-password-card";

export default async function SettingsPage() {
  await requireAdmin();

  const origins = parseCsvEnv("PUBLIC_FORM_ALLOWED_ORIGINS");
  const captchaEnabled =
    process.env.NODE_ENV === "production" || process.env.ALLOW_CAPTCHA_BYPASS !== "true";

  return (
    <AppShell currentPath="/settings">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Runtime Configuration</CardTitle>
            <CardDescription>Safe read-only values for this deployment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span>{process.env.NODE_ENV}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Admin email</span>
              <span>{process.env.ADMIN_EMAIL ?? "Not configured"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Allowed public origins</span>
              <span className="max-w-[60%] text-right">
                {origins.length ? origins.join(", ") : "Not configured"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate limit enabled</span>
              <span>{hasRateLimitConfigured() ? "Yes" : "No"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CAPTCHA enabled</span>
              <span>{captchaEnabled ? "Yes" : "No"}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database configured</span>
              <span>{process.env.DATABASE_URL ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>
        <ChangePasswordCard />
      </section>
    </AppShell>
  );
}
