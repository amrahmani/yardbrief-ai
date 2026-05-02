create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  business_name text not null default 'Business Name Placeholder',
  contact_email text not null default 'hello@example.com',
  phone text not null default '',
  default_tone text not null default 'Professional',
  default_disclaimer text not null default '',
  default_product_type text not null default 'yardbrief',
  use_client_nickname_by_default boolean not null default true,
  do_not_require_exact_address boolean not null default true,
  remove_image_metadata_before_upload boolean not null default false,
  cloud_sync_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.users (id) on delete cascade,
  product_type text not null default 'yardbrief',
  plan text not null default 'free',
  usage_month text not null,
  reports_generated_this_month integer not null default 0,
  ai_generations_this_month integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  product_type text not null default 'yardbrief',
  name text not null,
  client_name text not null default '',
  client_nickname text not null default '',
  location text not null default '',
  site_type text not null default '',
  brief_type text not null default '',
  summary text not null default '',
  notes text not null default '',
  stage text not null default 'First visit',
  status text not null default 'Active',
  budget_range text not null default '',
  due_date text not null default '',
  last_updated text not null default '',
  tags jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  recent_site_visits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  project_id text not null unique references public.projects (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  scheduled_for text not null default '',
  lead text not null default '',
  attendees jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  observations jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  form jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  site_visit_id uuid not null references public.site_visits (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  label text not null default '',
  caption text not null default '',
  photo_type text not null default 'Other',
  file_name text not null default '',
  storage_status text not null default 'local_only',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id text primary key,
  project_id text not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  product_type text not null default 'yardbrief',
  title text not null default '',
  type text not null default '',
  tone text,
  markdown text,
  status text not null default 'Drafting',
  created_at_label text not null default '',
  updated_at_label text not null default '',
  audience text not null default '',
  summary text not null default '',
  highlights jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_visits_updated_at on public.site_visits;
create trigger set_site_visits_updated_at
before update on public.site_visits
for each row
execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.projects enable row level security;
alter table public.site_visits enable row level security;
alter table public.photos enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
on public.users
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.users;
create policy "Users can create their own profile"
on public.users
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = id)
with check ((select auth.uid()) is not null and (select auth.uid()) = id);

drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own subscription" on public.subscriptions;
create policy "Users can create their own subscription"
on public.subscriptions
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own subscription" on public.subscriptions;
create policy "Users can update their own subscription"
on public.subscriptions
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can view their own projects" on public.projects;
create policy "Users can view their own projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own projects" on public.projects;
create policy "Users can create their own projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own projects"
on public.projects
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can view their own site visits" on public.site_visits;
create policy "Users can view their own site visits"
on public.site_visits
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own site visits" on public.site_visits;
create policy "Users can create their own site visits"
on public.site_visits
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own site visits" on public.site_visits;
create policy "Users can update their own site visits"
on public.site_visits
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can view their own photo metadata" on public.photos;
create policy "Users can view their own photo metadata"
on public.photos
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own photo metadata" on public.photos;
create policy "Users can create their own photo metadata"
on public.photos
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own photo metadata" on public.photos;
create policy "Users can update their own photo metadata"
on public.photos
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can delete their own photo metadata" on public.photos;
create policy "Users can delete their own photo metadata"
on public.photos
for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can view their own reports" on public.reports;
create policy "Users can view their own reports"
on public.reports
for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can create their own reports" on public.reports;
create policy "Users can create their own reports"
on public.reports
for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their own reports" on public.reports;
create policy "Users can update their own reports"
on public.reports
for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
