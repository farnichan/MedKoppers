-- Initial schema for the MCQ question bank.
--
-- Security model (see CLAUDE.md):
--   * subjects, questions and options are readable by anyone (anon key).
--   * answer_keys holds which option is correct. RLS is on with NO policies and
--     all privileges are revoked from anon/authenticated, so it can only be read
--     by server code using the secret (service role) key.
--   * Nobody can write through the public API; content is edited in the
--     Supabase dashboard or by server-side scripts.

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- subjects (e.g. Pharmacology)
-- ---------------------------------------------------------------------------
create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------
create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  subject_id     uuid not null references public.subjects (id) on delete restrict,
  -- Optional topic tag within the subject, e.g. 'Antimicrobials'.
  topic          text check (topic is null or length(trim(topic)) > 0),
  question_text  text not null check (length(trim(question_text)) > 0),
  -- Optional path of an image inside the 'question-images' storage bucket,
  -- e.g. 'pharmacology/nephron.png'. Not a full URL.
  image_path     text check (image_path is null or length(trim(image_path)) > 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index questions_subject_id_idx on public.questions (subject_id);
create index questions_subject_topic_idx on public.questions (subject_id, topic);

-- ---------------------------------------------------------------------------
-- options (answer choices). Contains NO information about correctness.
-- ---------------------------------------------------------------------------
create table public.options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  option_text  text not null check (length(trim(option_text)) > 0),
  -- Display order: 1 = A, 2 = B, ...
  position     smallint not null check (position between 1 and 10),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (question_id, position),
  -- Lets answer_keys check that the correct option belongs to the same question.
  unique (question_id, id)
);

-- ---------------------------------------------------------------------------
-- answer_keys: exactly one correct option per question. SERVER-ONLY.
-- ---------------------------------------------------------------------------
create table public.answer_keys (
  -- Primary key on question_id => at most one correct answer per question.
  question_id        uuid primary key references public.questions (id) on delete cascade,
  correct_option_id  uuid not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- The correct option must be one of this question's own options.
  foreign key (question_id, correct_option_id)
    references public.options (question_id, id)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger set_updated_at before update on public.subjects
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.questions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.options
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.answer_keys
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.subjects    enable row level security;
alter table public.questions   enable row level security;
alter table public.options     enable row level security;
alter table public.answer_keys enable row level security;

-- Public, read-only content.
create policy "Anyone can read subjects"
  on public.subjects for select to anon, authenticated using (true);
create policy "Anyone can read questions"
  on public.questions for select to anon, authenticated using (true);
create policy "Anyone can read options"
  on public.options for select to anon, authenticated using (true);

-- Belt and braces: no writes through the public API, even if a policy is
-- added by mistake later.
revoke insert, update, delete, truncate on public.subjects  from anon, authenticated;
revoke insert, update, delete, truncate on public.questions from anon, authenticated;
revoke insert, update, delete, truncate on public.options   from anon, authenticated;

-- answer_keys: no policies at all, and no privileges for public roles.
revoke all on public.answer_keys from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------
insert into public.subjects (name, slug)
values ('Pharmacology', 'pharmacology')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Storage bucket for question images (public read; uploads only via the
-- dashboard or the secret key, because there are no storage policies).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'question-images',
  'question-images',
  true,
  2097152, -- 2 MB per image keeps pages fast on mobile data
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;
