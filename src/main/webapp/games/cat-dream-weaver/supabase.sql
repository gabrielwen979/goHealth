-- 《肉墊的夢境編織》Supabase 資料表與 RLS 設定
-- 在 Supabase SQL Editor 整份貼上執行；可重複執行（冪等）。
-- 注意：user_id 為 unique，若與 games/text-maze 共用同一專案，
-- 兩款遊戲會覆寫彼此的存檔列，建議使用獨立專案或獨立資料表。

-- gen_random_uuid() 在 Supabase 預設可用（pgcrypto / PG13+ 內建）
create table if not exists public.game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  game_state jsonb not null default '{"current_level":1,"last_position":{"x":1,"y":1},"fish_score":0}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.game_saves is '肉墊的夢境編織：每位玩家一列存檔（含匿名使用者）';
comment on column public.game_saves.game_state is '{current_level, last_position:{x,y}, fish_score}';

-- 啟用列層級安全，沒有 Policy 的角色一律無法存取
alter table public.game_saves enable row level security;

-- 每次更新自動刷新 updated_at，讓前端可用它比較雲端/本機誰較新
create or replace function public.game_saves_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists game_saves_set_updated_at on public.game_saves;
create trigger game_saves_set_updated_at
  before update on public.game_saves
  for each row
  execute function public.game_saves_touch_updated_at();

-- Policy：僅已驗證（含匿名登入）的使用者，且只能操作自己的列
drop policy if exists "game_saves_select_own" on public.game_saves;
create policy "game_saves_select_own"
  on public.game_saves
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "game_saves_insert_own" on public.game_saves;
create policy "game_saves_insert_own"
  on public.game_saves
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "game_saves_update_own" on public.game_saves;
create policy "game_saves_update_own"
  on public.game_saves
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 權限：不開放 anon 角色，不提供 delete（刪除帳號時由 on delete cascade 清除）
revoke all on public.game_saves from anon;
grant select, insert, update on public.game_saves to authenticated;
