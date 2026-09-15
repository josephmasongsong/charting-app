/**
 * Field styling for the controls on list and index pages — the search boxes,
 * sort pickers and filter dropdowns.
 *
 * These had drifted from the design system's field spec in three ways: they
 * used `--radius-control` (4px) instead of `--radius-input` (2px), 14px text
 * instead of 15px, and carried no focus ring at all. The forms
 * (EventForm, SiteForm, ReferralForm) already follow the spec; these constants
 * carry the same treatment onto the list pages so a search box and a form field
 * are visibly the same control.
 *
 * The shared half of that treatment now lives in `form-fields.ts`, which also
 * dresses the fields inside the admin dialogs. Height and padding stay here
 * because a search box carries neither of the form field's.
 */

import { dsFieldBase } from './form-fields';

/** Search input. `pl-8` leaves room for the magnifier button inside the field. */
export const listSearchInputClass = `h-9 pl-8 ${dsFieldBase}`;

/** Sort and filter dropdown triggers. Width is set per use. */
export const listSelectTriggerClass = `h-9 ${dsFieldBase}`;
