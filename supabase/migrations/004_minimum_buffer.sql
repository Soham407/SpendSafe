-- Add minimum_buffer to profiles for "The Automator" (Phase 3)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minimum_buffer NUMERIC DEFAULT 1000;
