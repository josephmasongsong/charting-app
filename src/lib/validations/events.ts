// app/lib/validations/events.ts
import { z } from 'zod';

// Duration object schema for form steps
const durationSchema = z
  .object({
    hours: z.number().min(0).max(23),
    minutes: z.number().min(0).max(59),
  })
  .refine(
    data => data.hours > 0 || data.minutes > 0,
    'Duration must be greater than 0'
  );

// Basic info schema (Step 1)
export const eventBasicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  eventDate: z.date({ required_error: 'Event date is required' }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description too long'),
});

// Details schema (Step 2) - matches form state exactly
export const eventDetailsSchema = z.object({
  eventDuration: durationSchema,
  adminDuration: durationSchema.refine(
    data => data.hours >= 0 && data.minutes >= 0,
    'Admin duration cannot be negative'
  ),
  newParticipants: z.number().min(0, 'New participants cannot be negative'),
  returningParticipants: z
    .number()
    .min(0, 'Returning participants cannot be negative'),
  eventIsYouthFocused: z.boolean(),
  totalCost: z
    .string()
    .refine(
      cost => /^\d+(\.\d{1,2})?$/.test(cost),
      'Total cost must be a valid monetary amount'
    ),
});

// Associations base schema (Step 3 - without refinement)
export const eventAssociationsBaseSchema = z.object({
  activityTypeId: z.string().min(1, 'Activity type is required'),
  siteId: z.string().min(1, 'Site is required'),
  hasCoHost: z.boolean(),
  communityPartnerId: z.string().optional(),
});

// Associations schema with refinement (Step 3)
export const eventAssociationsSchema = eventAssociationsBaseSchema.refine(
  data => {
    if (data.hasCoHost && !data.communityPartnerId) {
      return false;
    }
    return true;
  },
  {
    message: "Community partner is required when 'Has Co-Host' is selected",
    path: ['communityPartnerId'],
  }
);

// Complete create event schema (for API) - more flexible date handling
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  eventDate: z
    .union([
      z
        .string()
        .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
      z.date(),
    ])
    .transform(date => (typeof date === 'string' ? date : date.toISOString())),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description too long'),
  eventDuration: z.number().min(1, 'Event duration must be at least 1 minute'),
  adminDuration: z.number().min(0, 'Admin duration cannot be negative'),
  newParticipants: z.number().min(0, 'New participants cannot be negative'),
  returningParticipants: z
    .number()
    .min(0, 'Returning participants cannot be negative'),
  eventIsYouthFocused: z.boolean(),
  hasCoHost: z.boolean(),
  totalCost: z
    .string()
    .refine(
      cost => /^\d+(\.\d{1,2})?$/.test(cost),
      'Total cost must be a valid monetary amount'
    ),
  activityTypeId: z.string().min(1, 'Activity type is required'),
  siteId: z.string().min(1, 'Site is required'),
  communityPartnerId: z.string().nullable(),
});

// Update event schema (for admin edits)
export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  eventDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description too long'),
  eventDuration: z.number().min(1, 'Event duration must be at least 1 minute'),
  adminDuration: z.number().min(0, 'Admin duration cannot be negative'),
  newParticipants: z.number().min(0, 'New participants cannot be negative'),
  returningParticipants: z
    .number()
    .min(0, 'Returning participants cannot be negative'),
  eventIsYouthFocused: z.boolean(),
  hasCoHost: z.boolean(),
  totalCost: z
    .string()
    .refine(
      cost => /^\d+(\.\d{1,2})?$/.test(cost),
      'Total cost must be a valid monetary amount'
    ),
  activityTypeId: z.string().uuid('Invalid activity type'),
  siteId: z.string().uuid('Invalid site'),
  communityPartnerId: z.string().uuid('Invalid community partner').nullable(),
});

// Type exports
export type EventBasicInfo = z.infer<typeof eventBasicInfoSchema>;
export type EventDetails = z.infer<typeof eventDetailsSchema>;
export type EventAssociations = z.infer<typeof eventAssociationsSchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;

// Utility function to convert minutes to human readable format
export function minutesToHumanReadable(totalMinutes: number): string {
  if (totalMinutes === 0) return '0 minutes';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}
