import { z } from 'zod';
import { isChannel, isReferredTo } from '@/lib/referral-options';

export const createReferralSchema = z.object({
  siteId: z.string().uuid('Please select a site'),
  // The form sends the native date input's YYYY-MM-DD string straight through.
  referralDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date'),
  channel: z.string().refine(isChannel, 'Please choose how it came up'),
  referredTo: z
    .string()
    .refine(isReferredTo, 'Please choose where you pointed the tenant'),
});

export const updateReferralSchema = createReferralSchema;

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralInput = z.infer<typeof updateReferralSchema>;
