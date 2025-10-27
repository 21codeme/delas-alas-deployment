-- Presence table for cross-device online status
-- Run this in the Supabase SQL Editor

create table if not exists presence (
  user_id uuid primary key,
  status text not null default 'offline', -- 'online' | 'offline'
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table presence enable row level security;

-- Policies: allow anon to read everyone (dashboard lists),
-- and allow authenticated users to upsert their own presence.
drop policy if exists "Allow anon read presence" on presence;
create policy "Allow anon read presence"
  on presence for select
  using (true);

-- If you are not signing requests with user JWTs in the browser, allow anon upsert/update
-- NOTE: If you later switch to Supabase Auth JWTs, replace these with auth.uid() checks
drop policy if exists "Allow anon insert presence" on presence;
create policy "Allow anon insert presence"
  on presence for insert
  with check (true);

drop policy if exists "Allow anon update presence" on presence;
create policy "Allow anon update presence"
  on presence for update
  using (true);

-- Helpful index for queries
create index if not exists presence_updated_at_idx on presence(updated_at desc);




create table if not exists presence (
  user_id uuid primary key,
  status text not null default 'offline', -- 'online' | 'offline'
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table presence enable row level security;

-- Policies: allow anon to read everyone (dashboard lists),
-- and allow authenticated users to upsert their own presence.
drop policy if exists "Allow anon read presence" on presence;
create policy "Allow anon read presence"
  on presence for select
  using (true);

-- If you are not signing requests with user JWTs in the browser, allow anon upsert/update
-- NOTE: If you later switch to Supabase Auth JWTs, replace these with auth.uid() checks
drop policy if exists "Allow anon insert presence" on presence;
create policy "Allow anon insert presence"
  on presence for insert
  with check (true);

drop policy if exists "Allow anon update presence" on presence;
create policy "Allow anon update presence"
  on presence for update
  using (true);

-- Helpful index for queries
create index if not exists presence_updated_at_idx on presence(updated_at desc);


