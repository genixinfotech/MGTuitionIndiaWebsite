# MG Tuition India

Small-batch live online tuition marketing site for all major Indian syllabi (CBSE, ICSE, State Boards).

Built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.

## Setup

```bash
cd "MGTuition India"
npm install
cp .env.example .env
```

Add your ZeptoMail **API host** and **Send Mail Token** to `.env`. Do not prefix those values with `VITE_` — the token stays on the server.

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

Edit contact numbers, offices, boards, and copy in `src/lib/site.ts`.

Form submissions (assessment, contact, tutor) are emailed through ZeptoMail. The from-address in `.env` must be a sender verified on your ZeptoMail Agent.
