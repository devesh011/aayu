-- Aayu database schema (Postgres / Supabase)
-- Personal-use app: every table is locked to the single owner via RLS.

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  nickname text,
  birth_date date not null,
  relationship text not null,
  vibe text not null check (vibe in ('warm-family','funny-close','sweet','formal','minimal')),
  phone text,
  email text,
  preferred_channels text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  vibe text not null check (vibe in ('warm-family','funny-close','sweet','formal','minimal')),
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  days_before smallint not null check (days_before in (7,1,0)),
  sent_at timestamptz not null default now(),
  unique (contact_id, days_before, sent_at)
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table contacts enable row level security;
alter table templates enable row level security;
alter table notification_log enable row level security;
alter table push_subscriptions enable row level security;

create policy "owner can manage own contacts" on contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner can manage own templates" on templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner can manage own notification_log" on notification_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner can manage own push_subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
