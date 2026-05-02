alter table public.subscriptions
  add column if not exists status text not null default 'demo',
  add column if not exists billing_interval text,
  add column if not exists stripe_customer_id text not null default '',
  add column if not exists stripe_subscription_id text not null default '',
  add column if not exists stripe_price_id text not null default '',
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false;

create unique index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id <> '';

create unique index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id <> '';

comment on column public.subscriptions.status is
  'Billing lifecycle status. Future RevenueCat mobile subscriptions should write into this same row.';
