# Admin Setup and Security

This project uses Supabase Auth + Row Level Security (RLS) with a DB-backed admin flag.

## 1) Disable self-signup in Supabase

In Supabase Dashboard:

1. Go to `Authentication` -> `Providers` -> `Email`.
2. Disable public signups (invite-only / no self-registration).
3. Keep only the login methods you actually use.

This prevents arbitrary authenticated users from being created in production.

## 2) Create the admin user

Create the user in Supabase Auth (Dashboard -> `Authentication` -> `Users` -> `Add user`).

Then insert the user's UUID into `public.admin_users`.

```sql
insert into public.admin_users (id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (id) do nothing;
```

Alternative lookup by email:

```sql
insert into public.admin_users (id)
select id
from auth.users
where email = 'admin@your-domain.tld'
on conflict (id) do nothing;
```

## 3) Frontend environment variables

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (canonical/SEO base URL for browser)

Optional:

- `VITE_ADMIN_EMAIL` (advisory UI check only; not security authority)
- `VITE_PLAUSIBLE_DOMAIN`
- `VITE_PLAUSIBLE_SCRIPT_URL` (defaults to `https://plausible.io/js/script.js`)

Build/runtime:

- `SITE_URL` (used by sitemap generation script)

## 4) Security model summary

- `public.is_admin()` checks if `auth.uid()` exists in `public.admin_users`.
- Admin write actions on `products`, `categories`, `projects`, `team_members`, `inquiries` require `is_admin() = true`.
- Public storefront reads remain available as before.
- Storage writes for `product-images`, `project-images`, `team-images` require admin status.

## 5) Inquiries notifications (Supabase Edge Function)

The repository contains `supabase/functions/inquiry-notify/index.ts`.

Expected behavior:

- Receives Supabase Database Webhook payload for `INSERT` on table `public.inquiries`.
- Validates `x-webhook-secret` header against `WEBHOOK_SECRET`.
- Sends a Discord message to `DISCORD_WEBHOOK_URL`.

Required function secrets:

- `WEBHOOK_SECRET`
- `DISCORD_WEBHOOK_URL`
- `ADMIN_URL` (optional, used for admin link in message)

### Activation steps (Supabase Dashboard)

1. Deploy function:
   - `supabase functions deploy inquiry-notify`
2. Set secrets:
   - `supabase secrets set WEBHOOK_SECRET=...`
   - `supabase secrets set DISCORD_WEBHOOK_URL=...`
   - Optional: `supabase secrets set ADMIN_URL=https://your-domain.tld`
3. Open `Database` -> `Webhooks` -> create webhook:
   - Table: `public.inquiries`
   - Events: `INSERT`
   - Method: `POST`
   - URL: `https://<project-ref>.functions.supabase.co/inquiry-notify`
   - Header: `x-webhook-secret: <WEBHOOK_SECRET>`
4. Save and test by submitting one inquiry from the public site.

### Verification

- New inquiry row is created in `public.inquiries`.
- Discord channel receives one notification.
- Duplicate sends within a short interval are deduplicated by the function.
