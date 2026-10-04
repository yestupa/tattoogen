import { z } from 'zod';

export const CONTACT_CATEGORIES = [
  'billing',
  'account',
  'generation',
  'privacy',
  'other',
] as const;

export const contactRequestSchema = z.object({
  requesterName: z.string().trim().min(2).max(80),
  requesterEmail: z.string().trim().email().max(254),
  category: z.enum(CONTACT_CATEGORIES),
  subject: z.string().trim().min(4).max(160),
  message: z.string().trim().min(20).max(5000),
  locale: z.enum(['en', 'zh']).default('en'),
  website: z.string().max(200).default(''),
  startedAt: z.number().int().positive(),
});

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

export function isLikelyHumanContact({
  website,
  startedAt,
  now = Date.now(),
}: {
  website: string;
  startedAt: number;
  now?: number;
}) {
  const elapsed = now - startedAt;
  return website.trim() === '' && elapsed >= 3_000 && elapsed <= 86_400_000;
}
