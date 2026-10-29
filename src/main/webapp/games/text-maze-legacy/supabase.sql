create table if not exists public.game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  game_state jsonb not null default '{"current_level":1,"player_pos":{"x":1,"y":1},"high_score":0}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

drop policy if exists "Players can read their own game save" on public.game_saves;
create policy "Players can read their own game save"
  on public.game_saves
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Players can create their own game save" on public.game_saves;
create policy "Players can create their own game save"
  on public.game_saves
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Players can update their own game save" on public.game_saves;
create policy "Players can update their own game save"
  on public.game_saves
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.game_saves to authenticated;
