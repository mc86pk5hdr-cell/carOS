-- Rename nickname -> name (now auto-computed from make/model/year, not user-editable)
-- Rename reg_number -> license_plate (terminology change)
-- Drop vin (no longer captured)

alter table vehicles rename column nickname to name;
alter table vehicles rename column reg_number to license_plate;
alter table vehicles drop column vin;
