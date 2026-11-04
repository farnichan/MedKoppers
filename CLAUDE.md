@AGENTS.md

# MedKoppers

MedKoppers (working name; rename via `APP_NAME` in `src/lib/config.ts`) is an MCQ question bank web app for MBBS students in Bangladesh practising for their professional exams.

The owner is a designer with limited coding experience: explain changes in plain language, ask before anything that needs their input (keys, passwords, account settings), and keep the setup simple and standard.

## V1 scope (build only this)

A simple landing page (`/`) with a floating frosted-glass navbar whose main CTA, "Practice Test", opens a single Pharmacology test page (`/practice`):
- Each attempt shows `QUESTIONS_PER_TEST` (10) random Pharmacology MCQs on one scrolling page, drawn from the whole bank. "Try new questions" draws a fresh random set. Each has question text, an optional image, and usually 4–5 options with exactly one correct.
- Student picks one option per question, taps Submit at the bottom.
- After submit: each question shows Correct / Wrong / Not answered, the correct option is highlighted, and the score (e.g. 14/20) appears at the top. 
- No explanations, accounts/logins, timers, or other subjects. English only.
- Must work well on phones. Low data use is no longer a priority (owner's call, Nov 2026): rich visuals and animation are fine, within reason.
- Visual design: see "Design system" below.

## Stack

- Next.js 16 (App Router, TypeScript, Cache Components enabled), Tailwind CSS v4, ESLint
- Supabase: Postgres database + Storage (bucket `question-images`)
- `@supabase/supabase-js` only (no auth, so no `@supabase/ssr`)
- Deploy target: Vercel (not deployed yet)

## Folder structure

```
src/app/page.tsx          Landing page (static: hero + example question preview)
src/app/practice/page.tsx Test page (server component; loads questions)
src/app/actions.ts        Server Actions: `submitTest` (marks on the server), `drawNewQuestions` (fresh random set)
src/app/layout.tsx        Root layout + metadata
src/components/TestForm.tsx  Client component: selection, submit, results UI
src/components/Navbar.tsx    Floating frosted-glass navbar (in root layout)
src/components/OptionRow.tsx Shared answer-option visuals (test page + landing preview)
src/components/Logo.tsx      Logo image (public/logo.svg)
src/components/ui/           buttonClass() helper
src/components/pixel/        PixelArt renderer, pixel drawings (art.ts), BlinkingCells
src/components/TopicTag.tsx  Pastel topic pill
src/components/Footer.tsx    Footer (in root layout)
src/lib/copy.ts           All user-facing copy + score reactions
src/lib/config.ts         App name, subject slug, questions per test, bucket name
src/lib/questions.ts      getQuestionBank() (cached, all questions, NO answers) + drawRandomQuestions() (per request)
src/lib/grading.ts        parseQuestionIds() + parseAnswers() + gradeTest(): server-only marking
src/lib/types.ts          Shared types (StudentQuestion has no correctness field)
src/lib/supabase/public.ts  Client with publishable key (RLS applies)
src/lib/supabase/admin.ts   Client with secret key (bypasses RLS) — "server-only"
supabase/migrations/      SQL migrations (source of truth for the schema)
supabase/seed-images/     Placeholder images uploaded by the seed script
scripts/seed.mjs          Seeds ~20 dummy Pharmacology MCQs + images (idempotent)
scripts/db-push.mjs       Applies migrations using SUPABASE_DB_URL
```

## Brand & design system

"Kop" is Bangla slang for acing something; MedKoppers = people acing med school. Audience: Bangladeshi public med school students in their early twenties.

- **Tone: serious and trustworthy first.** Plain, clear English copy. Wit/humour (incl. Banglish or "brainrot") only in small microcopy such as score reactions or notifications, kept low-key. (A loud meme/rickshaw-art version was tried and rejected as not credible; it's in git history at commit 69596a1.)
- **All user-facing text lives in `src/lib/copy.ts`** (`COPY`, `scoreReaction()`), never hard-coded in components.
- **Gamified pixel-art look.** MCQs are treated like a game: chunky game buttons with a 3D bottom edge, a sticky "quest map" (one block per question) on the test page, "+10 XP" on correct answers, and a results screen with a title ("Level complete", "Game over"…), 0–3 pixel stars and XP. Keep question/option text in the readable body font.
- **Base look:** inspired by app.geekymedics.com: white, clean, faint graph-paper grid (`.graph-paper`, stray pastel squares sitting in grid cells), cards with a grid texture fading in from the corner (`.card-grid`), pastel tint tags/icon tiles, and **pixel-art illustrations used like emoji**. Never copy Geeky Medics' own artwork; draw our own.
- **Pixel art:** `src/components/pixel/PixelArt.tsx` renders a grid of letters as a crisp inline SVG (colours in `PALETTE`, "." = transparent). Drawings live in `src/components/pixel/art.ts` (ANSWER_SHEET, LIGHTNING, PHONE, TROPHY, STAR, STAR_EMPTY, TEA, SPARKLE, FLOAT_SHADOW, and `capsule()` which generates a pill at any resolution; `BOLD_CAPSULE` colours). When resizing with CSS, add `h-auto` or the SVG keeps its original height.
- **Hero animation:** the capsule floats (`animate-float`, with `FLOAT_SHADOW` on phones), sparkles twinkle (`animate-twinkle`), and `BlinkingCells` (client component) lights up random graph-paper cells, skipping the element whose id is passed as `keepOutId` so text stays readable. Animations are defined in `@theme` in globals.css; a global `prefers-reduced-motion` rule turns them off.
- **Colours** (`@theme` in `src/app/globals.css`): `brand` #0C1892 (logo navy: buttons, selection, progress) with `brand-hover`/`brand-soft`; `ink`, `muted`, `subtle` (text); `line` (borders); `grid` (graph-paper lines); `soft` (panels); `lime` #C0FF00 (logo accent, sparing); pastel `tint-blue|lime|peach|pink|cyan`; `correct`/`correct-soft`, `wrong`/`wrong-soft`. Careful: every colour token also creates `bg-<name>`/`text-<name>` classes, so don't name custom CSS classes `bg-<token>` (that's why the grid class is `graph-paper`, not `bg-grid`).
- **Logo:** `public/logo.svg` (symbol + wordmark, used in navbar via `Logo`), `public/logo-mark.svg` (symbol only, footer), `src/app/icon.svg` (favicon, same symbol).
- **Type:** Parkinsans (`font-heading`) for headings only (incl. the big score number); DM Sans (`font-sans`, the body default) for everything else, buttons included. **No pixel fonts in the UI** (owner's call: hard to read; Pixelify Sans and Silkscreen were tried and dropped). The game feel comes from pixel-art illustrations, animation and game elements, not type.
- **Components:** `buttonClass({ variant: primary|lime|secondary, size })` (slim, 8px radius, subtle bevel: thin top highlight + faint bottom edge, body font), `OptionRow` (shared option visuals), `TopicTag` (pastel pill, consistent tint per topic).
- **Navbar:** fixed, floating, rounded frosted glass (`rounded-2xl bg-white/60 backdrop-blur-xl`) with the logo and a "Take test" CTA; in the root layout. Because it's fixed it takes no space: pages need ~`pt-28` top padding, and the test page's sticky quest bar sits at `top-[84px]` (`sm:top-[92px]`) just below it.
- **Landing page:** full-viewport hero (`min-h-svh`, headline "Ace your prof finals", floating capsule positioned relative to the headline), then the feature cards. No sample question.
- **Footer:** thick navy (`bg-brand`, rounded top) that plays on the logo: the logo's tilted lime and black cards (with the white tick) from `public/logo-mark.svg` are drawn large in the corner (`LogoCards` in `Footer.tsx`), plus the logo mark, a short line and a lime "Take test" button. Different placement on phones vs desktop so the tick stays visible and text stays clear.
- **Quiz hydration:** the quiz section streams in and becomes interactive slightly later than the page. Until then (`useHydrated()` in `TestForm.tsx`) the options and Submit are disabled, because an early tap would trigger a native form submit that reloads the page with a new random set.
- Option rows hide the native radio with `sr-only`; the row must stay `relative` or tapping an option makes the page jump.
- Mobile-first; check every change at 375px wide.
- Avoid `new Date()` in server components outside a request (Cache Components errors during prerender).
- Dev gotcha: the dev server sometimes keeps serving stale CSS after `globals.css` changes; restart `npm run dev` if new styles don't appear (or check with `npm run build` + `npm run start -- -p 3001`, the "prod" entry in `.claude/launch.json`).

## Database schema

- `subjects` (id, name, slug unique, created_at, updated_at). Seeded with Pharmacology (`pharmacology`) in the migration.
- `questions` (id, subject_id → subjects, topic text NULL, question_text, image_path text NULL, created_at, updated_at). `topic` is an optional free-text tag within the subject (e.g. "Antimicrobials"). `image_path` is a path inside the `question-images` bucket, e.g. `pharmacology/nephron.png`, not a full URL.
- `options` (id, question_id → questions ON DELETE CASCADE, option_text, position 1–10 = A–J, created_at, updated_at). Unique (question_id, position). Contains nothing about correctness.
- `answer_keys` (question_id PK → questions ON DELETE CASCADE, correct_option_id, created_at, updated_at). Composite FK (question_id, correct_option_id) → options(question_id, id) guarantees the correct option belongs to that question; PK guarantees at most one correct answer per question.
- `set_updated_at()` trigger on every table.
- Storage bucket `question-images`: public read, 2 MB limit, PNG/JPEG/WebP only. No storage policies, so uploads only via dashboard or secret key.

Schema changes: always add a NEW migration with `npx supabase migration new <name>`; never edit a migration that has already been applied.

## Security rules (must not be broken)

1. **Correct answers are never sent to the browser before submission.** Question loading selects only questions/options and uses the publishable key; `answer_keys` is unreadable with that key anyway.
2. **All marking happens on the server** (`submitTest` → `gradeTest`). The browser sends the IDs of the questions it was shown plus `{ questionId: optionId }`, and receives results; it never decides what is correct. The server only counts IDs that really exist in the subject and looks up answers itself.
3. Row Level Security is enabled on every table. subjects/questions/options: SELECT for anon + authenticated only. `answer_keys`: no policies and all privileges revoked from anon/authenticated. No public writes anywhere.
4. The secret (service role) key is used only in `src/lib/supabase/admin.ts` (guarded by `import "server-only"`) and in local scripts. Never prefix it with `NEXT_PUBLIC_`, never import admin.ts from a client component.
5. Validate anything the browser sends to a Server Action (see `parseAnswers`).

## Environment variables

See `.env.example`. Real values live in `.env.local` (git-ignored).
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (legacy anon key also works)
- `SUPABASE_SECRET_KEY` (server only; legacy service_role key also works)
- `SUPABASE_DB_URL` (optional; Session pooler connection string, only for `npm run db:push`)

## How to run

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run db:push              # apply migrations to the Supabase project
npm run seed                 # add dummy questions + images
npm run dev                  # http://localhost:3000
```

Other commands: `npm run lint`, `npm run build`.

Free-plan Supabase projects pause after ~1 week of inactivity; the app then fails with "fetch failed" and the project URL stops resolving. Restore it from the Supabase dashboard.

The `/practice` page frame is pre-built; the random question set streams in per request (`connection()` in `src/app/practice/page.tsx`). The question bank itself is cached for a few minutes (`cacheLife("minutes")` in `src/lib/questions.ts`), so dashboard edits appear after a short delay (restart `npm run dev` to see them immediately).
