do $$
declare
  owner_user_id uuid;
begin
  select id
  into owner_user_id
  from auth.users
  where lower(email) = lower('gabrielwen979@gmail.com');

  if owner_user_id is null then
    raise exception 'The goHealth owner account gabrielwen979@gmail.com was not found.';
  end if;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"admin","gohealth_owner":true}'::jsonb
  where id = owner_user_id;

  update public.gohealth_profiles
  set display_name = 'SSU'
  where user_id = owner_user_id;
end;
$$;

create or replace function public.gohealth_account_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as account
    where account.id = (select auth.uid())
      and (
        account.banned_until is null
        or account.banned_until <= now()
      )
  );
$$;

revoke all on function public.gohealth_account_is_active() from public, anon;
grant execute on function public.gohealth_account_is_active() to authenticated;

drop policy if exists "Users can read their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can read their own goHealth profile"
  on public.gohealth_profiles for select to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.gohealth_account_is_active())
  );

drop policy if exists "Users can create their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can create their own goHealth profile"
  on public.gohealth_profiles for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select public.gohealth_account_is_active())
  );

drop policy if exists "Users can update their own goHealth profile"
  on public.gohealth_profiles;
create policy "Users can update their own goHealth profile"
  on public.gohealth_profiles for update to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.gohealth_account_is_active())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.gohealth_account_is_active())
  );
