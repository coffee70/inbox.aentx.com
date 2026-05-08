import { z } from "zod";

const maxUrl = 2048;

export const publicSubmissionSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.email().trim().max(254),
  company: z.string().trim().max(160).optional(),
  role: z.string().trim().max(120).optional(),
  website: z.url().trim().max(maxUrl).optional(),
  interestType: z.string().trim().max(100).optional(),
  message: z.string().trim().max(4000).optional(),
  captchaToken: z.string().trim().max(2048).optional(),
  honeypot: z.string().max(0).optional(),
});

export const adminSubmissionPatchSchema = z.object({
  status: z
    .enum(["NEW", "REVIEWED", "CONTACTED", "ARCHIVED", "SPAM"])
    .optional(),
  adminNotes: z.string().trim().max(4000).optional(),
});
