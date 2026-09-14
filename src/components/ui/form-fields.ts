/**
 * Field styling for form controls inside dialogs — the labels, inputs and
 * select triggers in the create/edit modals.
 *
 * The design system specifies one look for a field wherever it appears
 * (`design-system/uploads/bch-shadcn-implementation-guide.md` §4.2): a 2px
 * `--radius-input` corner, the dark `--border-input` rule, 15px text, and a
 * 15px normal-weight label. The page-level forms (EventForm, SiteForm,
 * ReferralForm) already follow it, and `list-controls.ts` carried the same
 * treatment onto the search and filter controls on list pages.
 *
 * The admin dialogs were the remaining holdout, drifted in four ways: they
 * used `--radius-control` (4px, the button radius) instead of `--radius-input`
 * (2px), 14px text instead of 15px, bold 13.5px labels instead of normal 15px,
 * and carried no focus ring. These constants close that gap so a field in a
 * dialog is visibly the same control as a field on a form page.
 *
 * The focus treatment is the DS Select's — a 3px `--action-selected` ring with
 * an `--action-primary` border, which `docs/gaps/login.md:16` names as the
 * consistent choice across fields.
 */

/**
 * Everything common to a field control. Height, horizontal padding and width
 * differ per control, so those are layered on by the exports below rather than
 * baked in here — `list-controls.ts` layers its own for the same reason.
 */
export const dsFieldBase =
  'rounded-(--radius-input) border-(--border-input) bg-(--surface-card) text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)';

/** Field label. Normal weight — the DS marks required with an asterisk, not bold. */
export const fieldLabelClass = 'text-[15px] font-normal';

/** Single-line text, number and email inputs. */
export const fieldInputClass = `h-9 px-2.5 ${dsFieldBase}`;

/** Select trigger. Fills its field column, matching the inputs above it. */
export const fieldSelectTriggerClass = `h-9 w-full px-2.5 ${dsFieldBase}`;

/** Muted helper line under a field. */
export const fieldHelperClass = 'text-[12.5px] text-(--text-muted)';
