-- VMS Phase 2: maintenance_records, maintenance_attachments, RLS, storage bucket

create table maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  workshop_name text,
  invoice_number text,
  mileage integer,
  cost numeric(10,2),
  currency text not null default 'MYR',
  category text not null check (category in (
    'road_tax','insurance','inspection','license','battery','oil','oil_filter',
    'air_filter','brake_pads','coolant','transmission_oil','timing_belt',
    'spark_plugs','tyres','custom'
  )),
  notes text,
  parts_replaced text,
  labour_cost numeric(10,2),
  next_recommended_service_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table maintenance_attachments (
  id uuid primary key default gen_random_uuid(),
  maintenance_record_id uuid not null references maintenance_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,
  file_type text not null check (file_type in ('image','pdf')),
  file_name text not null,
  created_at timestamptz not null default now()
);

create index maintenance_records_vehicle_id_idx on maintenance_records (vehicle_id);
create index maintenance_records_user_date_idx on maintenance_records (user_id, date desc);
create index maintenance_attachments_record_id_idx on maintenance_attachments (maintenance_record_id);

alter table maintenance_records enable row level security;
alter table maintenance_attachments enable row level security;

create policy "maintenance_select_own" on maintenance_records for select using (user_id = auth.uid());
create policy "maintenance_insert_own" on maintenance_records for insert with check (
  user_id = auth.uid() and exists (select 1 from vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
);
create policy "maintenance_update_own" on maintenance_records for update using (user_id = auth.uid()) with check (
  user_id = auth.uid() and exists (select 1 from vehicles v where v.id = vehicle_id and v.user_id = auth.uid())
);
create policy "maintenance_delete_own" on maintenance_records for delete using (user_id = auth.uid());

create policy "attachments_select_own" on maintenance_attachments for select using (user_id = auth.uid());
create policy "attachments_insert_own" on maintenance_attachments for insert with check (
  user_id = auth.uid() and exists (select 1 from maintenance_records m where m.id = maintenance_record_id and m.user_id = auth.uid())
);
create policy "attachments_delete_own" on maintenance_attachments for delete using (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('maintenance-attachments', 'maintenance-attachments', false);

create policy "maintenance_attachments_owner" on storage.objects for all using (
  bucket_id = 'maintenance-attachments' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'maintenance-attachments' and (storage.foldername(name))[1] = auth.uid()::text
);
