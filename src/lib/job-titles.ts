import type { UserJobTitle } from '@/db/schema/users.schema';

/**
 * Job titles that carry meaning elsewhere in the app. `users.job_title` is
 * plain text with no database enum (partners have NULL), so anything that
 * depends on a specific title must compare against these constants.
 */
export const TEW_JOB_TITLE: UserJobTitle = 'Tenant Engagement Worker';
export const PPH_JOB_TITLE: UserJobTitle = 'People Plants & Homes';
