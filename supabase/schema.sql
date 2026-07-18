-- ============================================================
-- Tuning Show — Supabase schema
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ---------- TABLES ----------

create table if not exists participant_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'new',        -- new | handled | rejected
  full_name     text not null,
  phone         text not null,
  age           int,
  email         text,
  vehicle_make  text,
  vehicle_model text,
  year          int,
  license_plate text,
  nomination    text,
  photos        text[] not null default '{}',        -- storage paths in participant-photos
  agreed_terms  boolean not null default false
);

create table if not exists visitor_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  status         text not null default 'new',
  full_name      text not null,
  phone          text not null,
  city           text,
  party_size     int,
  email          text,
  occupation     text,
  heard_about    text,
  visited_before text,
  interests      text[] not null default '{}',
  consent        boolean not null default false
);

create table if not exists partner_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  status         text not null default 'new',
  company        text not null,
  contact_person text not null,
  position       text,
  phone          text,
  email          text,
  website        text,
  idea           text,
  deck           text                                 -- storage path in partner-decks
);

-- ---------- ROW LEVEL SECURITY ----------
-- Anonymous visitors may INSERT (submit a form) but never read.
-- Only authenticated (the admin account) may read / update / delete.

alter table participant_requests enable row level security;
alter table visitor_requests     enable row level security;
alter table partner_requests      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['participant_requests','visitor_requests','partner_requests']
  loop
    execute format('drop policy if exists anon_insert on %I;', t);
    execute format('drop policy if exists auth_select on %I;', t);
    execute format('drop policy if exists auth_update on %I;', t);
    execute format('drop policy if exists auth_delete on %I;', t);

    execute format('create policy anon_insert on %I for insert to anon           with check (true);', t);
    execute format('create policy auth_select on %I for select to authenticated  using (true);', t);
    execute format('create policy auth_update on %I for update to authenticated  using (true) with check (true);', t);
    execute format('create policy auth_delete on %I for delete to authenticated  using (true);', t);
  end loop;
end $$;

-- ---------- STORAGE BUCKETS ----------
insert into storage.buckets (id, name, public)
values ('participant-photos', 'participant-photos', false),
       ('partner-decks',      'partner-decks',      false)
on conflict (id) do nothing;

-- Storage policies: anon can upload, admin can read (for signed URLs).
drop policy if exists ts_storage_anon_upload on storage.objects;
drop policy if exists ts_storage_auth_read   on storage.objects;

create policy ts_storage_anon_upload on storage.objects
  for insert to anon
  with check (bucket_id in ('participant-photos', 'partner-decks'));

create policy ts_storage_auth_read on storage.objects
  for select to authenticated
  using (bucket_id in ('participant-photos', 'partner-decks'));

-- ============================================================
-- AFTER RUNNING THIS:
-- 1) Authentication → Providers → Email: turn OFF "Allow new users to sign up".
-- 2) Authentication → Users → Add user: create the single admin (email+password).
-- 3) Put the Project URL + anon key into the site env (see .env.example).
-- ============================================================
