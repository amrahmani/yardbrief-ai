create index if not exists projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

create index if not exists site_visits_user_id_updated_at_idx
  on public.site_visits (user_id, updated_at desc);

create index if not exists reports_user_id_updated_at_idx
  on public.reports (user_id, updated_at desc);

create index if not exists reports_project_id_updated_at_idx
  on public.reports (project_id, updated_at desc);

create index if not exists photos_user_id_created_at_idx
  on public.photos (user_id, created_at desc);

drop policy if exists "Users can delete their own profile" on public.users;
create policy "Users can delete their own profile"
on public.users
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users can delete their own subscription" on public.subscriptions;
create policy "Users can delete their own subscription"
on public.subscriptions
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete their own projects"
on public.projects
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own site visits" on public.site_visits;
create policy "Users can delete their own site visits"
on public.site_visits
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own reports" on public.reports;
create policy "Users can delete their own reports"
on public.reports
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    contact_email,
    default_disclaimer,
    default_product_type,
    cloud_sync_enabled
  )
  values (
    new.id,
    new.email,
    coalesce(new.email, 'hello@example.com'),
    'This report is generated from user-provided information and should be reviewed before sending. It is not legal, engineering, structural, plumbing, electrical, or compliance advice.',
    'yardbrief',
    true
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (
    user_id,
    product_type,
    plan,
    status,
    usage_month
  )
  values (
    new.id,
    'yardbrief',
    'free',
    'demo',
    to_char(timezone('utc', now()), 'YYYY-MM')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();
