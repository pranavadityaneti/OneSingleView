-- Add intermediary column to motor_policies table
ALTER TABLE motor_policies ADD COLUMN IF NOT EXISTS intermediary TEXT;
