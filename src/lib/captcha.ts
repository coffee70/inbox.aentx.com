type CaptchaVerification = {
  valid: boolean;
  reason?: string;
};

export async function verifyCaptcha(token: string | undefined): Promise<CaptchaVerification> {
  const bypass =
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_CAPTCHA_BYPASS === "true";
  if (bypass) return { valid: true };

  if (!token) return { valid: false, reason: "missing_token" };
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { valid: false, reason: "missing_secret" };

  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    },
  );

  const result = (await response.json()) as { success?: boolean };
  if (!result.success) return { valid: false, reason: "verification_failed" };
  return { valid: true };
}
