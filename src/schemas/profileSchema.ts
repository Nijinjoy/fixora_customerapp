import { z } from 'zod';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z
    .string()
    .trim()
    .refine(
      v => v === '' || EMAIL_PATTERN.test(v),
      'Enter a valid email address',
    )
    .transform(v => v || undefined),
  photo: z.string().optional(),
});

export type ProfileFormInput = z.input<typeof profileSchema>;
export type ProfileFormOutput = z.output<typeof profileSchema>;
