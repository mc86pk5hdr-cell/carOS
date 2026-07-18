-- Maintenance form updates:
-- - Next recommended service becomes a mileage (was a date)
-- - New free-text fields: recommendation, attended_by, mechanic_name

alter table maintenance_records
  add column recommendation text,
  add column attended_by text,
  add column mechanic_name text,
  add column next_recommended_service_mileage integer check (next_recommended_service_mileage >= 0);

alter table maintenance_records drop column next_recommended_service_date;
