-- Add a unique constraint to prevent faculty from being in two classes at the same time
-- This provides database-level validation as a safety net

CREATE UNIQUE INDEX IF NOT EXISTS unique_faculty_day_slot 
ON timetable_slots (faculty_id, day, slot_number);

COMMENT ON INDEX unique_faculty_day_slot IS 'Ensures a faculty member cannot be allocated to multiple classes on the same day and slot';