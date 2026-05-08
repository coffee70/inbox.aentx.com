import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function parseCsvEnv(name: string) {
  return getEnv(name)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
