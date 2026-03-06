# Humor Project 2: Admin Panel (Week 6)

This app is a Next.js admin panel with Supabase + Google auth.

## Assignment coverage

- All `/admin/*` routes are protected by Google login + `profiles.is_superadmin === true`
- `READ` profiles
- `CREATE/READ/UPDATE/DELETE` images
- `READ` captions
- Dashboard with data stats

## Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Google OAuth redirect

In Supabase Auth settings, include:

- `http://localhost:3000/auth/callback`
- your Vercel URL + `/auth/callback`

The callback route in this app is exactly `/auth/callback`.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Superadmin bootstrap (how to avoid lockout)

If you cannot access `/admin` yet, your logged-in profile likely has `is_superadmin = false`.

You must have an existing superadmin (or instructor/admin access tooling) set your `profiles` row `is_superadmin` to `true`. This is a data update and does **not** require changing RLS policies.

## Deploy

1. Push to GitHub.
2. Import repo in Vercel.
3. Add env vars in Vercel project settings.
4. Deploy.
5. Disable Vercel deployment protection (per assignment).
