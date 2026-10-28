@AGENTS.md

# MedKoppers

MedKoppers (working name; rename via `APP_NAME` in `src/lib/config.ts`) is an MCQ question bank web app for MBBS students in Bangladesh practising for their professional exams.

The owner is a designer with limited coding experience: explain changes in plain language, ask before anything that needs their input (keys, passwords, account settings), and keep the setup simple and standard.

## V1 scope (build only this)

A single Pharmacology test page:
- All Pharmacology MCQs on one scrolling page. Each has question text, an optional image, and usually 4–5 options with exactly one correct.
- Student picks one option per question, taps Submit at the bottom.
- After submit: each question shows Correct / Wrong / Not answered, the correct option is highlighted, and the score (e.g. 14/20) appears at the top. A "Try again" button resets.
- No explanations, accounts/logins, timers, or other subjects. English only.
- Must work well on phones and load fast on slow mobile data (system fonts, small images, cached question data).
- Styling is deliberately plain; the real UI will be designed later.

## Stack

- Next.js 16 (App Router, TypeScript, Cache Components enabled), Tailwind CSS v4, ESLint
- Supabase: Postgres database + Storage (bucket `question-images`)
- `@supabase/supabase-js` only (no auth, so no `@supabase/ssr`)
- Deploy target: Vercel (not deployed yet)

## Folder structure

```
src/app/page.tsx          Test page (server component; loads questions)
src/app/actions.ts        Server Action `submitTest`: marks answers on the server
src/app/layout.tsx        Root layout + metadata
src/components/TestForm.tsx  Client component: selection, submit, results UI
src/lib/config.ts         App name, subject slug, bucket name
src/lib/questions.ts      getTestQuestions(): questions + options, NO answers (cached)
src/lib/grading.ts        parseAnswers() + gradeTest(): server-only marking
src/lib/types.ts          Shared types (StudentQuestion has no correctness field)
src/lib/supabase/public.ts  Client with publishable key (RLS applies)
src/lib/supabase/admin.ts   Client with secret key (bypasses RLS) — "server-only"
supabase/migrations/      SQL migrations (source of truth for the schema)
supabase/seed-images/     Placeholder images uploaded by the seed script
scripts/seed.mjs          Seeds ~20 dummy Pharmacology MCQs + images (idempotent)
scripts/db-push.mjs       Applies migrations using SUPABASE_DB_URL
```

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
2. **All marking happens on the server** (`submitTest` → `gradeTest`). The browser sends `{ questionId: optionId }` and receives results; it never decides what is correct. The total comes from the database, not from the browser.
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

Question data is cached for a few minutes (`cacheLife("minutes")` in `src/lib/questions.ts`), so dashboard edits appear after a short delay (restart `npm run dev` to see them immediately).
