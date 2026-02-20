# Deploy to Cloudflare Pages

This project is configured for static deployment with SPA routing.

## 1) Build configuration

- Framework preset: `None` (or Vite if available)
- Build command: `npm ci && npm run build`
- Build output directory: `dist`

## 2) Environment variables (Pages Project -> Settings -> Environment variables)

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (example: `https://www.cf-veranstaltungstechnik.berlin`)
- `SITE_URL` (same value as `VITE_SITE_URL`, used for sitemap generation)

Optional:

- `VITE_ADMIN_EMAIL`
- `VITE_PLAUSIBLE_DOMAIN`
- `VITE_PLAUSIBLE_SCRIPT_URL`

## 3) SPA routing

`public/_redirects` already contains:

```txt
/* /index.html 200
```

Cloudflare Pages supports `_redirects`, so client-side deep links work after deploy.

## 4) Custom domain

1. Add custom domain in Cloudflare Pages project.
2. Configure DNS (`CNAME`/`ALIAS`) as instructed by Cloudflare.
3. Wait for TLS certificate provisioning.
4. Update `VITE_SITE_URL` and `SITE_URL` to the final production domain.
5. Trigger a new deploy so canonical URLs and sitemap use the correct domain.

## 5) Post-deploy checks

1. Open a deep link directly, e.g. `/mietshop/<slug>`.
2. Open `/sitemap.xml` and verify production URLs.
3. Open page source and confirm canonical URL points to production domain.
4. Submit a test inquiry and verify DB entry (and notification if enabled).
