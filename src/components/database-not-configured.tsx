import { Card } from "@/components/ui/card";

export function DatabaseNotConfigured() {
  return (
    <Card className="space-y-2">
      <h2 className="text-lg font-semibold">Database not configured</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Set <code>DATABASE_URL</code> in <code>.env.local</code> and restart the dev server.
      </p>
    </Card>
  );
}
