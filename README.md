# 🎂 Aayu

### *every year, held well*

A personal birthday-reminder and wish-sending app — add the people you don't want to forget, get nudged before their birthday, and send something that actually feels like you.

Built for one person: **D3v8ll**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=googlegemini&logoColor=white)

---

## 📋 Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Deployment](#deployment-vercel)
- [Architecture notes](#architecture-notes)
- [Known limitations](#known-limitations)

---

## ✨ Features

| | |
|---|---|
| 👥 **People** | Birthdays with name, nickname, relationship, default vibe. Full edit/delete, timezone-safe countdown. |
| 📸 **Photos** | Set a photo once per contact — reused automatically in every avatar and poster. |
| 📝 **Templates** | Reusable subject/body pairs per vibe, live preview, side-by-side design comparison. |
| 🤖 **AI Messages** | Gemini-generated messages — pick a language, a tone, or write your own freeform prompt. Save straight into Templates. |
| 🖼️ **Photo Posters** | Real server-side compositing — the *actual* uploaded photo, pixel-perfect, never AI-regenerated. See status table below. |
| 📬 **Intro emails** | One-time, throttled heads-up before real wishes start — helps with Gmail deliverability. |
| 🔒 **Invite-only accounts** | Public signups off by default optional — only the owner invites. Fully isolated per-account data via RLS. |
| 🔔 **Push notifications** | Optional browser reminders before each birthday. |
| 💬 **WhatsApp / IG / Snap** | Quick-send links and copy-to-clipboard for channels without an email API. |

### Poster designs

| Design | Status | Notes |
|---|:---:|---|
| Polaroid | ✅ Built | Tilted taped photo, script headline, optional AI-generated background |
| Butterfly Typographic | ✅ Built | Bubble-lettered wordmark, photo card + name tag |
| Impreza Brand-style | 🚧 Scaffolded | Registry entry exists, compositor not yet written |
| B&W Bold | 🚧 Scaffolded | Registry entry exists, compositor not yet written |

Font picker (six script/handwriting fonts) is shared across every design.

---

## 🛠 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth + DB + Storage | Supabase (Postgres, RLS, Auth, Storage) |
| Email sending | Nodemailer via Gmail SMTP |
| AI text | Google Gemini (`@google/genai`) |
| AI images *(backgrounds only)* | Pollinations.ai — free, no key |
| Poster compositing | `@napi-rs/canvas` — native, server-side |
| Push notifications | Web Push (VAPID) |

---

## 🚀 Getting started

```bash
git clone https://github.com/devesh011/aayu
cd aayu
npm install
```

Create `.env.local` and fill in every variable below, then:

```bash
npm run dev
```

### 🔑 Environment variables

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — **server-only**, bypasses RLS |
| `GMAIL_USER` | Gmail address to send from |
| `GMAIL_APP_PASSWORD` | Gmail App Password (needs 2FA enabled) |
| `GEMINI_API_KEY` | Google AI Studio key, free tier |
| `OWNER_EMAIL` | Server-side check — only this email can invite people |
| `NEXT_PUBLIC_OWNER_EMAIL` | Client-side check — shows/hides the Invite box |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notification public key |
| *(private VAPID key)* | Named per your own push route — signs push payloads server-side |

<details>
<summary>🔤 <strong>Font setup</strong> (click to expand)</summary>

<br>

Poster designs need real font files in `assets/fonts/` — **must be committed to git**, or fonts silently fall back to a default with no error:

- `AlexBrush-Regular.ttf`, `Playball-Regular.ttf`, `Caveat-Regular.ttf`, `Caveat-Medium.ttf`, `Caveat-SemiBold.ttf`, `Caveat-Bold.ttf` — [Google Fonts](https://fonts.google.com), used for name tags
- `RubikWetPaint-Regular.ttf` — [Google Fonts](https://fonts.google.com/specimen/Rubik+Wet+Paint), used for the Butterfly wordmark

</details>

<details>
<summary>🗄️ <strong>Database setup</strong> (click to expand)</summary>

<br>

Run every migration in `supabase/migrations/` against your Supabase project, in order — schema, `photo_url` column, widened `vibe` CHECK constraint, `intro_sent_at` column, and the `wish-photos` storage bucket + policies.

</details>

<details>
<summary>🔒 <strong>Invite-only setup</strong> (optional — click to expand)</summary>

<br>

By default, anyone can self-register via the magic-link sign-in form. To lock that down:

1. In Supabase → **Authentication → Settings**, turn **off** "Allow new user signups".
2. Set `OWNER_EMAIL` and `NEXT_PUBLIC_OWNER_EMAIL` to your own sign-in email.
3. On the **People** page, an **"Invite someone"** box appears only for that account. It calls Supabase's admin `inviteUserByEmail` API (`app/api/invite-user/route.ts`) — creates the account and sends a real invite link, bypassing the signups-disabled restriction since it's an admin action, not self-registration.
4. Every invited person gets a fully isolated, empty account — never access to yours, and no way to invite further people themselves.

Skip this entirely if an open sign-up app is fine — every account is isolated by Row Level Security regardless.

</details>

---

## ☁️ Deployment (Vercel)

1. Import the repo, add every environment variable above in **Project Settings**.
2. In Supabase → **Authentication → URL Configuration**, whitelist your production URL for every redirecting page: `/contacts`, `/photos`, `/generate`, `/templates`.
3. `next.config.ts` must include:
   ```ts
   serverExternalPackages: ["@napi-rs/canvas"]
   ```
4. Platform-specific `@napi-rs/canvas-*` binaries (e.g. `-win32-x64-msvc` for local dev) belong in `optionalDependencies`, **never** `dependencies` — otherwise `npm install` hard-fails on Vercel's Linux build with `EBADPLATFORM`.
5. Send one real test wish after deploying — exercises Supabase, Gmail, and canvas compositing together.

---

## 🏗 Architecture notes

- **Auth** — Supabase magic-link only, no passwords. Every table is Row-Level-Security scoped to `auth.uid()`.
- **API routes are auth-gated server-side** (`lib/requireUser.ts`) — every protected route checks a Bearer token, not just client-side UI hiding.
- **Poster compositors** live in `lib/posterCompositors/`, registered in one `index.ts` map. New design = one file + one registry line.
- **The real photo is never touched by AI.** AI only generates decorative backgrounds (explicitly no people) or message text — the photo itself is always composited by code, pixel-perfect, every time.
- **Gmail de-threading** — every outgoing subject gets invisible zero-width spaces appended, so repeated sends don't collapse into one conversation thread.

---

## ⚠️ Known limitations

- Impreza and B&W Bold poster designs are scaffolded but not implemented.
- Email deliverability depends on personal Gmail SMTP — fine at personal scale, no dedicated sending domain.
- AI backgrounds depend on Pollinations.ai, a free third-party service with looser moderation than a major vendor — keep prompts generic and decorative.

---

*Aayu · blessed by d3v8ll*
