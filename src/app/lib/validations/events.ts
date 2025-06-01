import { z } from 'zod';

// Helper function to convert hours and minutes to total minutes
const hoursMinutesToMinutes = (hours: number, minutes: number): number => {
  return hours * 60 + minutes;
};

// Helper function to convert minutes to HH:MM format
export const minutesToTimeString = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Helper function to convert minutes to human readable format
export const minutesToHumanReadable = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

// Helper function to convert total minutes back to hours and minutes
export const minutesToHoursAndMinutes = (
  totalMinutes: number
): { hours: number; minutes: number } => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

// Duration validation schema
const durationValidation = z
  .object({
    hours: z
      .union([z.string(), z.number()])
      .transform(val => Number(val))
      .refine(val => !isNaN(val), 'Hours must be a valid number')
      .refine(val => val >= 0 && val <= 23, 'Hours must be between 0 and 23'),
    minutes: z
      .union([z.string(), z.number()])
      .transform(val => Number(val))
      .refine(val => !isNaN(val), 'Minutes must be a valid number')
      .refine(val => val >= 0 && val <= 59, 'Minutes must be between 0 and 59'),
  })
  .refine(
    data => {
      const totalMinutes = hoursMinutesToMinutes(data.hours, data.minutes);
      return totalMinutes > 0;
    },
    {
      message: 'Duration must be greater than 0 minutes',
      path: ['hours'], // Show error on hours field
    }
  );

// Participant validation - accepts both string and number, converts to number
const participantValidation = z
  .union([z.string(), z.number()])
  .transform(val => Number(val))
  .refine(val => !isNaN(val), 'Must be a valid number')
  .refine(val => val >= 0, 'Must be 0 or greater')
  .refine(val => Number.isInteger(val), 'Must be a whole number');

// Cost validation - accepts both string and number, converts to string
const costValidation = z
  .union([z.string(), z.number()])
  .transform(val => String(val))
  .refine(val => !isNaN(Number(val)), 'Must be a valid number')
  .refine(val => Number(val) >= 0, 'Must be 0 or greater')
  .refine(
    val => /^\d+(\.\d{1,2})?$/.test(val),
    'Must be a valid currency amount (e.g., 10.50)'
  );

// Step 1: Basic Event Information
export const eventBasicInfoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .trim(),
  eventDate: z.date({ required_error: 'Please select an event date' }),
  // .refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
  //   message: 'Event date cannot be in the past',
  // }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be 5000 characters or less')
    .trim(),
});

// Step 2: Event Details
export const eventDetailsSchema = z.object({
  eventDuration: durationValidation,
  adminDuration: durationValidation,
  newParticipants: participantValidation,
  returningParticipants: participantValidation,
  eventIsYouthFocused: z.boolean(),
  totalCost: costValidation,
});

// Step 3: Associations (base schema without refinement)
export const eventAssociationsBaseSchema = z.object({
  activityTypeId: z.string().uuid('Please select a valid activity type'),
  siteId: z.string().uuid('Please select a valid site'),
  hasCoHost: z.boolean(),
  communityPartnerId: z.string().optional(),
});

// Step 3: Associations (with refinement for validation)
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

// Combined base schema without transformations
const createEventBaseSchema = eventBasicInfoSchema
  .merge(eventDetailsSchema)
  .merge(eventAssociationsBaseSchema);

// Combined schema with validation and transformation
export const createEventSchema = createEventBaseSchema
  .refine(
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
  )
  .transform(data => ({
    ...data,
    eventDuration: hoursMinutesToMinutes(
      data.eventDuration.hours,
      data.eventDuration.minutes
    ),
    adminDuration: hoursMinutesToMinutes(
      data.adminDuration.hours,
      data.adminDuration.minutes
    ),
    newParticipants: data.newParticipants,
    returningParticipants: data.returningParticipants,
    totalCost: data.totalCost,
    communityPartnerId: data.hasCoHost ? data.communityPartnerId : null,
  }));

export type EventBasicInfo = z.infer<typeof eventBasicInfoSchema>;
export type EventDetails = z.infer<typeof eventDetailsSchema>;
export type EventAssociations = z.infer<typeof eventAssociationsBaseSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
