-- ==============================================================================
-- SANA & ME — Seed Data & Initial Setup
-- ==============================================================================
-- Run this in your Supabase SQL Editor after running schema.sql.
-- Replace the emails with you and Sana's real emails!
-- ==============================================================================

-- 1. Whitelist the 2 authorized members
-- Change these emails to your actual email addresses
INSERT INTO public.authorized_members (email, display_name, role, is_approved)
VALUES 
  ('azan@example.com', 'Azan', 'member_1', true),
  ('sana@example.com', 'Sana', 'member_2', true)
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  is_approved = EXCLUDED.is_approved;

-- 2. Create the shared conversation container
INSERT INTO public.conversations (id, title)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sana & Azan')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed some cozy daily prompts for conversations
INSERT INTO public.daily_prompts (prompt_date, question, category)
VALUES
  (CURRENT_DATE, 'What is a small, quiet moment this week that made you smile?', 'cozy'),
  (CURRENT_DATE + 1, 'If we could teleport to any cafe in the world right now for coffee & dessert, where would we go?', 'wanderlust'),
  (CURRENT_DATE + 2, 'What song instantly reminds you of a great memory we shared?', 'nostalgia'),
  (CURRENT_DATE + 3, 'What is one funny inside joke that will never stop being funny?', 'inside_joke'),
  (CURRENT_DATE + 4, 'What is something you are really looking forward to this month?', 'future')
ON CONFLICT (prompt_date) DO NOTHING;
