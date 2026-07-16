-- VMS Phase 1: profiles, vehicles, reminder_items, RLS, storage bucket

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- vehicles
-- ─────────────────────────────────────────────────────────────────────────
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  make text not null,
  model text not null,
  year int,
  reg_number text not null,
  vin text,
  engine_number text,
  chassis_number text,
  fuel_type text check (fuel_type in ('petrol','diesel','hybrid','electric','other')),
  mileage integer default 0,
  mileage_unit text not null default 'km' check (mileage_unit in ('km','mi')),
  color text,
  photo_path text,
  purchase_date date,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reg_number)
);

create index vehicles_user_id_idx on vehicles (user_id);

alter table vehicles enable row level security;

create policy "vehicles_select_own" on vehicles
  for select using (user_id = auth.uid());
create policy "vehicles_insert_own" on vehicles
  for insert with check (user_id = auth.uid());
create policy "vehicles_update_own" on vehicles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "vehicles_delete_own" on vehicles
  for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- reminder_items
-- ─────────────────────────────────────────────────────────────────────────
create table reminder_items (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in (
    'road_tax','insurance','inspection','license','battery','oil','oil_filter',
    'air_filter','brake_pads','coolant','transmission_oil','timing_belt',
    'spark_plugs','tyres','custom'
  )),
  label text,
  due_date date,
  due_mileage integer,
  last_service_date date,
  interval_days integer,
  interval_mileage integer,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminder_items_user_due_idx on reminder_items (user_id, due_date);
create index reminder_items_vehicle_id_idx on reminder_items (vehicle_id);

alter table reminder_items enable row level security;

create policy "reminders_select_own" on reminder_items
  for select using (user_id = auth.uid());

create policy "reminders_insert_own" on reminder_items
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "reminders_update_own" on reminder_items
  for update using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (select 1 from vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
  );

create policy "reminders_delete_own" on reminder_items
  for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- storage: vehicle-photos (private bucket, per-user folder isolation)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', false);

create policy "vehicle_photos_owner" on storage.objects
  for all using (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'vehicle-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
