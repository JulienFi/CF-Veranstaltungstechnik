# UI/UX Lessons

## Patterns to keep
- Use shared design primitives before adding custom utility combinations.
- For admin forms, prefer `field-control` + `focus-ring` over hardcoded gray input stacks.
- For primary/secondary actions, use `btn-primary` and `btn-secondary` to keep hierarchy stable.
- Keep card surfaces consistent with `glass-panel` and `glass-panel--soft`.

## Mistakes to avoid
- Mixing old ad-hoc button/input classes with system classes creates visual drift.
- Legal/support pages should not be visually detached from the main page architecture.
- Repeating one-off class strings across files increases inconsistency risk.
- Never assume route params are already decoded; URL-encoded slugs can silently break detail pages.
- Avoid writing files with inconsistent shell encodings; this can introduce mojibake (`Ã¼`, `Ã¶`, `�`) in user-facing copy.

## Refinement checklist for next passes
- Verify rhythm consistency (`section-shell` spacing) across all public pages.
- Confirm focus states on every interactive admin control.
- Keep color emphasis constrained to primary actions and critical status signals.
- Ensure data-light pages have intentional fallback copy so layouts never feel empty.
- Run a quick marker scan for encoding artifacts in UI text before finalizing.

## Phase 1 lessons (2026-02-20)
- Do not use hardcoded status colors in admin views; map status surfaces to `badge--*` and `panel--*` variants.
- Keep admin form controls on `field-control focus-ring` for consistent keyboard focus and visual rhythm.
- Use `btn-primary` and `btn-secondary` for action rows; avoid one-off button stacks per page.
- Keep minimum touch target size at 44px via `tap-target` (or equivalent utility) on interactive controls.
- Keep visual migrations scoped to className and CSS token layers to avoid accidental logic regressions.
