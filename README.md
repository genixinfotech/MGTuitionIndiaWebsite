# MG Tuition

Small-batch live online tuition marketing site for CBSE, ICSE, and IGCSE (one-to-one). One codebase serves **India** and **GCC** — switch with the `Region` environment variable.

Built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.

## Region

Set **`Region=India`** or **`Region=GCC`** in Plesk Node.js custom environment variables (or in `.env` locally). The server injects the region into the page at runtime; no separate build per region is required.

For local development, set **`VITE_REGION=India`** or **`VITE_REGION=GCC`** in `.env` (Vite reads this at dev/build time).

| Region | Site name | Legal entity | Default email |
|--------|-----------|--------------|---------------|
| India | MG Tuition India | IdealMG Educare LLP | info@mgtuition.in |
| GCC | MG Tuition GCC | IdealMG Educare FZC | info@mgtuition.ae |

Region-specific copy, pricing, offices, and location dropdowns live in `src/lib/regions/india.ts` and `src/lib/regions/gcc.ts`.

## Setup

```bash
cd "MGTuition India"
npm install
cp .env.example .env
```

Add your ZeptoMail **API host** and **Send Mail Token** to `.env`. Do not prefix those values with `VITE_` — the token stays on the server.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Supabase project **Connect** dialog. Then run the SQL in `supabase/migrations/` in the Supabase SQL editor (this also creates the private `assessment-reports` storage bucket for PDFs). Promote staff or a student consultant with:

```sql
update public.profiles set role = 'staff' where email = 'you@mgtuition.in';
update public.profiles set role = 'student_consultant' where email = 'consultant@mgtuition.in';
```

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
