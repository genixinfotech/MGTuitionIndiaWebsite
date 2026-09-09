# MG Tuition

Small-batch live online tuition marketing site for CBSE, ICSE, and IGCSE (one-to-one). One codebase serves **India** and **GCC** — switch with the `Region` environment variable.

Built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.

## Region

Set **`Region=India`** or **`Region=GCC`** in Plesk Node.js custom environment variables, then **restart the Node app**. The server injects the region when serving pages and exposes it at `/api/public-config`.

`VITE_REGION` is only used during **`npm run build`** (build-time fallback). Setting it alone on Plesk without `Region` will not change the live site after a build unless you rebuild with that variable present in the shell.

| Region | Site name | Legal entity | Default email |
|--------|-----------|--------------|---------------|
| India | MG Tuition India | IdealMG Educare LLP | info@mgtuition.in |
| GCC | MG Tuition GCC | IdealMG Educare FZC | info@mgtuition.ae |

### Verify GCC is active

1. Restart the Node.js app after changing env vars.
2. Open `https://your-domain/api/public-config` — expect `"region":"GCC"`.
3. View page source — look for `window.__MG_PUBLIC_CONFIG__` with `"region":"GCC"`.
4. If `/api/public-config` shows GCC but the site still looks like India, hard-refresh or clear CDN/cache.

If the document root serves static files from `dist/` directly (bypassing Node), either route all traffic through Node (`app.cjs` / `server.mjs`) or rebuild with `VITE_REGION=GCC npm run build`.

Region-specific copy, pricing, offices, and location dropdowns live in `src/lib/regions/india.ts` and `src/lib/regions/gcc.ts`.

## Payments

| Region | Gateway | Status |
|--------|---------|--------|
| GCC | Stripe Checkout | Live in sandbox when `STRIPE_SECRET_KEY` is set |
| India | UPI + consultant confirmation | Razorpay will replace this after sandbox access |

Add these **server-only** variables (never prefix with `VITE_`):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Apply `supabase/migrations/20260908130000_tuition_payments.sql`, `supabase/migrations/20260908140000_payment_coverage.sql`, and `supabase/migrations/20260909125351_tuition_plans.sql` in the Supabase SQL editor for **each** region project. `tuition_plans` stores India rates in INR and GCC rates in USD; the app loads the rows that match `Region`.

Batches run a **fixed number of sessions per month** (8 for grades 1–9, 12 for 10–12). If a student joins after the month has started, checkout charges only the remaining scheduled classes on a prorata basis. From the next calendar month the full month is charged. Receipts show `Subject · Month · N classes`.

For local Stripe webhooks:

```bash
stripe listen --forward-to localhost:5173/api/payments/webhook
```

Then put the CLI webhook secret in `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`. Successful GCC checkouts return to `/portal/students` and mark admission + class sessions paid automatically.

## Setup

```bash
cd "MGTuition India"
npm install
cp .env.example .env
```

Add your ZeptoMail **API host** and **Send Mail Token** to `.env`. Do not prefix those values with `VITE_` — the token stays on the server.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project **Connect** dialog. Then run the SQL in `supabase/migrations/` in the Supabase SQL editor (this also creates the private `assessment-reports` storage bucket for PDFs). Promote internal users with:

```sql
update public.profiles set role = 'admin' where email = 'you@mgtuition.in';
update public.profiles set role = 'student-consultant' where email = 'consultant@mgtuition.in';
```

Portal roles use lowercase with hyphens: `superadmin`, `admin`, `subject-expert`, `marketing-manager`, `hr-manager`, `accounts`, `quality-manager`, `student-consultant`, `student`, `tutor`, and `parent`.

In Authentication → URL configuration, set the site URL to `http://localhost:5173` (and add `https://mgtuition.in` for production). Redirect URLs should include `/auth/callback` and `/update-password`.

To let parents create student logins, add **`SUPABASE_SERVICE_ROLE_KEY`** to the server `.env` or Plesk environment variables. Do not prefix it with `VITE_`. Then run the SQL in `supabase/migrations/` (including the student-role files).

```bash
npm run dev
```

## Scripts

- `npm run dev` — local development (forms post to `/api/email`)
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run start` — serve `dist` plus the ZeptoMail API (use this on the server)

## Production (forms / email)

Serving only the `dist` folder (Apache, nginx, cPanel static files) will show the site, but form posts never reach ZeptoMail. The browser can still get HTTP 200 because the host returns `index.html`.

On the server:

1. Deploy the full project (not only `dist`). Put ZeptoMail values in `.env` or in the host’s environment variables. `.env` is not in git.
2. `npm install` then `npm run build`
3. Keep Node running. On Plesk, enable Node.js with application root at the project folder, document root `dist`, and startup file `app.cjs`. Do not send `/api/` through `try_files` or `FallbackResource /index.html`.
4. Or run `npm start` / `pm2 start server.mjs --name mgtuition` and point the public site at that process.

Check: open `https://your-domain/api/email` — you should see JSON like `{"ok":true,"configured":true}`. If you see the homepage, the mail API is not wired up.

If the API is running and ZeptoMail still fails, add the **server’s public IP** to the Agent allowed-IP list (or turn IP restriction off). Localhost is already allowed; the live server is a different IP.

## Config

Contact numbers, offices, boards, pricing, and region copy are in `src/lib/regions/india.ts` and `src/lib/regions/gcc.ts`. Shared helpers resolve the active region from `Region` / `VITE_REGION` via `src/lib/region.ts`.

Form submissions (assessment, contact, tutor) are emailed through ZeptoMail. The from-address in `.env` must be a sender verified on your ZeptoMail Agent.
