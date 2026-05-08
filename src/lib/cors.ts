import { NextResponse } from "next/server";
import { parseCsvEnv } from "@/lib/utils";

export const allowedOrigins = parseCsvEnv("PUBLIC_FORM_ALLOWED_ORIGINS");

export function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

export function withPublicCors(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
