-- Nine Stacks global scoreboard.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text        not null,
  score       integer     not null,
  correct     integer     not null,
  created_at  timestamptz not null default now(),

  -- 1-12 visible characters, no leading/trailing spaces
  constraint name_length check (char_length(name) between 1 and 12 and name = btrim(name)),
  -- 52 cards over 9 stacks leaves at most 43 guesses
  constraint correct_range check (correct between 0 and 43),
  -- every correct guess is worth 10..250 points (50 x the max multiplier of 5),
  -- plus up to 9 stack bonuses of 25 and the 250 perfect-board bonus
  constraint score_range check (
    score >= 10 * correct
    and score <= 250 * correct + 9 * 25 + 250
  )
);

create index if not exists scores_top_idx on public.scores (score desc, created_at asc);

-- Anyone may read the board and add a score; nobody may edit or delete via the public key.
alter table public.scores enable row level security;

drop policy if exists "scores are public" on public.scores;
create policy "scores are public" on public.scores
  for select to anon using (true);

drop policy if exists "anyone can submit a score" on public.scores;
create policy "anyone can submit a score" on public.scores
  for insert to anon with check (true);

-- Only let the public key touch the columns it needs.
revoke all on public.scores from anon;
grant select (name, score, correct, created_at) on public.scores to anon;
grant insert (name, score, correct) on public.scores to anon;
