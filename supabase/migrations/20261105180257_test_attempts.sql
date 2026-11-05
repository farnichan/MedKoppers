-- Saved test results for signed-in students.
--
-- Security model (see CLAUDE.md):
--   * A student can READ only their own attempts and answers (RLS).
--   * Nobody can write through the public API. Attempts are saved by the
--     server (secret key) right after it has marked the test, using the user
--     id from the verified session, so scores can't be faked from the browser.
--   * The correct option is stored per answer so a past test can be reviewed.
--     That's only ever written after submission, so it never reveals answers
--     to a test that is still in progress.

-- ---------------------------------------------------------------------------
-- test_attempts: one row per submitted test
-- ---------------------------------------------------------------------------
create table public.test_attempts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete restrict,
  score       smallint not null check (score >= 0),
  total       smallint not null check (total > 0 and score <= total),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index test_attempts_user_created_idx on public.test_attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- attempt_answers: one row per question in an attempt
-- ---------------------------------------------------------------------------
create table public.attempt_answers (
  attempt_id          uuid not null references public.test_attempts (id) on delete cascade,
  question_id         uuid not null references public.questions (id) on delete cascade,
  -- Order the question was shown in (1 = first).
  position            smallint not null check (position between 1 and 50),
  -- NULL = not answered.
  selected_option_id  uuid,
  -- Snapshot at marking time, so history doesn't change if a key is edited.
  correct_option_id   uuid not null,
  is_correct          boolean not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create trigger set_updated_at before update on public.test_attempts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.attempt_answers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.test_attempts   enable row level security;
alter table public.attempt_answers enable row level security;

create policy "Students can read their own attempts"
  on public.test_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students can read answers in their own attempts"
  on public.attempt_answers for select to authenticated
  using (
    exists (
      select 1 from public.test_attempts a
      where a.id = attempt_id and a.user_id = (select auth.uid())
    )
  );

-- No writes through the public API, and nothing at all for logged-out users.
revoke all on public.test_attempts   from anon;
revoke all on public.attempt_answers from anon;
revoke insert, update, delete, truncate on public.test_attempts   from authenticated;
revoke insert, update, delete, truncate on public.attempt_answers from authenticated;
