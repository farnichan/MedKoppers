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
- Must work well on phones and load fast on slow mobile data (system fonts, small images, cached question data).
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
src/components/Logo.tsx      Wordmark (uses APP_NAME)
src/components/ui/           buttonClass() helper, Sticker
src/components/Footer.tsx    Footer (in root layout)
src/lib/copy.ts           All playful/Banglish copy + score reactions
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

"Kop" is Bangla slang for acing something; MedKoppers = people acing med school. The audience is Bangladeshi public med school students in their early twenties, so the brand is playful and meme-y, not clinical. Visual direction: **rickshaw art meets meme culture**.

- **Voice:** Banglish (Bangla in Roman letters) for flavour text, using BD med-school in-jokes (prof, viva, supple, proxy, Nilkhet sheets, load shedding, cha, Tripathi). Use the casual "tumi" form (kopaiso, koro), not "tui". Keep functional labels clear (e.g. "Your answer", "Correct answer"). Medical content (questions/options) stays in English.
- **All jokes/flavour text live in `src/lib/copy.ts`** (`COPY`, `scoreReaction()`), never hard-coded in components, so the owner can edit them.
- **Colours** (`@theme` in `src/app/globals.css`): `cream` (page bg, dotted), `paper` (cards), `ink` (text/outlines/shadows), `muted`, `pink` (primary), `yellow` (highlights, selected answer, score card), `teal`, `sky`, `orange`, `correct`/`correct-soft`, `wrong`/`wrong-soft`.
- **Shape language:** `border-2 border-ink`, rounded-xl/2xl, hard offset shadows (`shadow-hard-sm`/`shadow-hard`/`shadow-hard-lg`), slight rotations on stickers/cards.
- **Type:** Bricolage Grotesque (`next/font`), headlines `font-extrabold` with tight tracking.
- **Components:** `buttonClass({ variant: primary|yellow|plain, size })` (squishes on press), `Sticker` (tilted label), `Logo` (highlights "Kop" in APP_NAME), `.marker` (highlighter), `.zigzag` (rickshaw strip), `.wiggle`/`.pop-in` animations (respect reduced motion).
- **Navbar:** fixed, floating, frosted glass (`bg-paper/60 backdrop-blur-xl`) with ink outline; on every page via root layout, as is the `Footer`. Pages need ~`pt-28` top padding.
- Option rows hide the native radio with `sr-only`; the row must stay `relative` or tapping an option makes the page jump.
- Mobile-first; check every change at 375px wide.
- Dev gotcha: the dev server sometimes keeps serving stale CSS after `globals.css` changes; restart `npm run dev` if new colours/styles don't appear.

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

The `/practice` page frame is pre-built; the random question set streams in per request (`connection()` in `src/app/practice/page.tsx`). The question bank itself is cached for a few minutes (`cacheLife("minutes")` in `src/lib/questions.ts`), so dashboard edits appear after a short delay (restart `npm run dev` to see them immediately).
