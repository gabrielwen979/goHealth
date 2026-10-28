create table if not exists public.gohealth_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'goHealth 使用者'
    check (char_length(display_name) between 1 and 60),
  profile jsonb not null default '{
    "heightCm": null,
    "weightRecords": {},
    "preferences": {"dietType": "keto", "avoidFoods": ""},
    "recommendedMeals": [],
    "checkedItems": {}
  }'::jsonb check (jsonb_typeof(profile) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.gohealth_profiles enable row level security;

revoke all on public.gohealth_profiles from public, anon;
grant select, insert, update on public.gohealth_profiles to authenticated;

drop policy if exists "Users can read their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can read their own goHealth profile"
  on public.gohealth_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can create their own goHealth profile"
  on public.gohealth_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can update their own goHealth profile"
  on public.gohealth_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.create_gohealth_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.gohealth_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'goHealth 使用者'
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_gohealth_user_created on auth.users;
create trigger on_gohealth_user_created
  after insert on auth.users
  for each row execute procedure public.create_gohealth_profile_for_user();
