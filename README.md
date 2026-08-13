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

## Config

Edit contact numbers, offices, boards, and copy in `src/lib/site.ts`.

Form submissions (assessment, contact, tutor) are emailed through ZeptoMail. The from-address in `.env` must be a sender verified on your ZeptoMail Agent.
