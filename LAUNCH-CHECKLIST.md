# Launch Checklist (Stage 3)

## Forms and inquiry flow

- [ ] Home contact form submits successfully.
- [ ] Contact page form submits successfully.
- [ ] Shop inquiry flow (`/mietshop/anfrage`) submits with product context.
- [ ] Success message is consistent ("Antwort innerhalb von 24 Stunden").
- [ ] New records appear in `public.inquiries`.

## Admin and content operations

- [ ] Admin login works with DB-backed admin user (`admin_users`).
- [ ] Product CRUD works (create, edit, activate/deactivate, delete).
- [ ] Category CRUD works.
- [ ] Project CRUD works.
- [ ] Team CRUD works.
- [ ] Image uploads to Storage buckets still work.

## SEO and indexing

- [ ] Title/description/canonical render correctly on key pages.
- [ ] Open Graph tags render valid absolute URLs.
- [ ] `public/sitemap.xml` contains only production URLs.
- [ ] `public/robots.txt` is accessible and references sitemap.

## Routing and error handling

- [ ] Direct deep-link loads for SPA routes (refresh test).
- [ ] Unknown route renders a clean 404 state.
- [ ] `_redirects` fallback works in production.

## Responsive and UX sanity

- [ ] Header/nav works on mobile and desktop.
- [ ] SpotlightRig/Beam remains visible and interactive.
- [ ] Shop grid and product detail remain usable on mobile.
- [ ] Legal pages (`/impressum`, `/datenschutz`) have no placeholders.

## Performance quick pass

- [ ] Lighthouse quick pass completed (mobile + desktop).
- [ ] Largest Contentful Paint and CLS are within acceptable range.
- [ ] No blocking console errors in production.
