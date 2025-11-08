-- Add emoji column to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '🍽️';
