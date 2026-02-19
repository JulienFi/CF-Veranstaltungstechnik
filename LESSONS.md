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
