-- Add transmission type to vehicles

alter table vehicles
  add column transmission text check (transmission in ('automatic', 'manual'));
