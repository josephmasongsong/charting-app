import { z } from 'zod';

export const createSiteSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name must be 255 characters or less')
      .trim(),
    latitude: z
      .string()
      .refine(val => !isNaN(Number(val)), 'Latitude must be a valid number')
      .refine(
        val => Number(val) >= -90 && Number(val) <= 90,
        'Latitude must be between -90 and 90'
      ),
    longitude: z
      .string()
      .refine(val => !isNaN(Number(val)), 'Longitude must be a valid number')
      .refine(
        val => Number(val) >= -180 && Number(val) <= 180,
        'Longitude must be between -180 and 180'
      ),
    address: z
      .string()
      .min(1, 'Address is required')
      .max(500, 'Address must be 500 characters or less')
      .trim(),
    numberOfTenants: z
      .string()
      .refine(
        val => !isNaN(Number(val)),
        'Number of tenants must be a valid number'
      )
      .refine(
        val => Number(val) > 0,
        'Number of tenants must be greater than 0'
      ),
    hasCommunityRoom: z.boolean(),
    hasCommunityPartner: z.boolean(),
    communityPartnerId: z.string().optional(),
    isSingleSeniorOnly: z.boolean(),
    userId: z.string().uuid('Please select a valid user'),
  })
  .refine(
    data => {
      // If has community partner is true, community partner ID must be provided
      if (data.hasCommunityPartner && !data.communityPartnerId) {
        return false;
      }
      return true;
    },
    {
      message:
        "Community partner is required when 'Has Community Partner' is selected",
      path: ['communityPartnerId'],
    }
  );

export const updateSiteSchema = createSiteSchema;

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
