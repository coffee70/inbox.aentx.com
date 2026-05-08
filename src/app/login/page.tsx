import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/submissions");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex items-center gap-3">
            <Image src="/aentx-logo.png" alt="Aentx logo" width={40} height={40} priority />
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">Aentx</p>
              <CardTitle className="text-2xl">Inbox</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
