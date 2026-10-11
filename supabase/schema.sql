-- ==============================================================================
-- SANA & ME — 100% IDEMPOTENT SUPABASE SCHEMA & SEED SETUP
-- ==============================================================================
-- Run this entire script in Supabase SQL Editor.
-- Safe to re-run multiple times without errors.
-- ==============================================================================

-- 0. SCHEMA MIGRATIONS (Safe to re-run anytime)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_accent_color_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_accent_color_check 
      CHECK (accent_color IN ('blush', 'lavender', 'cream', 'rose', 'peach', 'mint', 'sky', 'violet'));
  END IF;
END $$;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY CHECK (id IN ('user-azan-001', 'user-sana-002')),
  display_name text NOT NULL,
  passcode text NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  accent_color text DEFAULT 'blush' CHECK (accent_color IN ('blush', 'lavender', 'cream', 'rose', 'peach', 'mint', 'sky', 'violet')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. AUTHORIZED MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.authorized_members (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  passcode text NOT NULL,
  role text NOT NULL CHECK (role IN ('member_1', 'member_2')),
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. CONVERSATIONS & CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'Sana & Azan',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY DEFAULT ('msg-' || gen_random_uuid()::text),
  conversation_id uuid DEFAULT '00000000-0000-0000-0000-000000000001',
  sender_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (sender_id IN ('user-azan-001', 'user-sana-002')),
  content text NOT NULL,
  reply_to_id text REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id text PRIMARY KEY DEFAULT ('react-' || gen_random_uuid()::text),
  message_id text NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (user_id IN ('user-azan-001', 'user-sana-002')),
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- 5. SHARED MEMORIES (Digital Scrapbook)
CREATE TABLE IF NOT EXISTS public.memories (
  id text PRIMARY KEY DEFAULT ('mem-' || gen_random_uuid()::text),
  created_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (created_by IN ('user-azan-001', 'user-sana-002')),
  title text NOT NULL,
  description text,
  memory_date date NOT NULL DEFAULT CURRENT_DATE,
  image_url text,
  location text,
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. SHARED NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id text PRIMARY KEY DEFAULT ('note-' || gen_random_uuid()::text),
  created_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (created_by IN ('user-azan-001', 'user-sana-002')),
  last_edited_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (last_edited_by IN ('user-azan-001', 'user-sana-002')),
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'idea', 'reminder', 'inside_joke', 'later')),
  is_pinned boolean DEFAULT false,
  color_tag text DEFAULT 'blush' CHECK (color_tag IN ('blush', 'lavender', 'cream', 'mint', 'peach')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. DAILY PROMPTS & ANSWERS
CREATE TABLE IF NOT EXISTS public.daily_prompts (
  id text PRIMARY KEY DEFAULT ('prompt-' || gen_random_uuid()::text),
  prompt_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  question text NOT NULL,
  category text DEFAULT 'cozy reflection',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_answers (
  id text PRIMARY KEY DEFAULT ('ans-' || gen_random_uuid()::text),
  prompt_id text NOT NULL REFERENCES public.daily_prompts(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (user_id IN ('user-azan-001', 'user-sana-002')),
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

-- 8. SHARED BUCKET LIST / THINGS TO DO TOGETHER
CREATE TABLE IF NOT EXISTS public.bucket_list_items (
  id text PRIMARY KEY DEFAULT ('bucket-' || gen_random_uuid()::text),
  created_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (created_by IN ('user-azan-001', 'user-sana-002')),
  title text NOT NULL,
  notes text,
  category text DEFAULT 'adventure' CHECK (category IN ('adventure', 'food', 'travel', 'relax', 'creative', 'cozy')),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by text REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_date date,
  created_at timestamptz DEFAULT now()
);

-- 9. SPECIAL DATES & COUNTDOWNS
CREATE TABLE IF NOT EXISTS public.special_dates (
  id text PRIMARY KEY DEFAULT ('date-' || gen_random_uuid()::text),
  created_by text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (created_by IN ('user-azan-001', 'user-sana-002')),
  title text NOT NULL,
  event_date date NOT NULL,
  description text,
  category text DEFAULT 'milestone' CHECK (category IN ('birthday', 'anniversary', 'trip', 'milestone', 'reminder')),
  is_recurring_yearly boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 10. BESTIE KINDNESS POINTS & DEEDS TRACKER
CREATE TABLE IF NOT EXISTS public.kindness_points (
  id text PRIMARY KEY DEFAULT ('pt-' || gen_random_uuid()::text),
  recipient_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (recipient_id IN ('user-azan-001', 'user-sana-002')),
  giver_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE CHECK (giver_id IN ('user-azan-001', 'user-sana-002')),
  points integer NOT NULL DEFAULT 1 CHECK (points > 0),
  reason text NOT NULL,
  category text DEFAULT 'thoughtful' CHECK (category IN ('treat', 'support', 'thoughtful', 'laughter', 'help', 'other')),
  created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- INITIAL PROFILES & CONVERSATION
-- ==============================================================================
INSERT INTO public.profiles (id, display_name, passcode, avatar_url, bio, accent_color)
VALUES 
  (
    'user-azan-001', 
    'Azan', 
    'azanisthebest', 
    null,
    '',
    'blush'
  ),
  (
    'user-sana-002', 
    'Sana', 
    'sanaisthebest', 
    null,
    '',
    'lavender'
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  passcode = EXCLUDED.passcode;

INSERT INTO public.authorized_members (id, user_id, display_name, passcode, role, is_approved)
VALUES 
  ('auth-azan', 'user-azan-001', 'Azan', 'azanisthebest', 'member_1', true),
  ('auth-sana', 'user-sana-002', 'Sana', 'sanaisthebest', 'member_2', true)
ON CONFLICT (id) DO UPDATE SET
  passcode = EXCLUDED.passcode;

INSERT INTO public.conversations (id, title)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sana & Azan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.daily_prompts (id, prompt_date, question, category)
VALUES (
  'prompt-initial-01',
  CURRENT_DATE,
  'What is a quiet, simple thing from this week that made you unexpectedly happy?',
  'cozy reflection'
)
ON CONFLICT (prompt_date) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (With Safe DROP POLICY IF EXISTS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_member" ON public.profiles;
CREATE POLICY "profiles_update_member" ON public.profiles FOR UPDATE USING (id IN ('user-azan-001', 'user-sana-002'));

-- Members
DROP POLICY IF EXISTS "authorized_members_select_all" ON public.authorized_members;
CREATE POLICY "authorized_members_select_all" ON public.authorized_members FOR SELECT USING (true);

-- Conversations
DROP POLICY IF EXISTS "conversations_all" ON public.conversations;
CREATE POLICY "conversations_all" ON public.conversations FOR ALL USING (true);

-- Messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (sender_id IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (sender_id IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "messages_delete" ON public.messages;
CREATE POLICY "messages_delete" ON public.messages FOR DELETE USING (sender_id IN ('user-azan-001', 'user-sana-002'));

-- Reactions
DROP POLICY IF EXISTS "reactions_select" ON public.message_reactions;
CREATE POLICY "reactions_select" ON public.message_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON public.message_reactions;
CREATE POLICY "reactions_insert" ON public.message_reactions FOR INSERT WITH CHECK (user_id IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "reactions_delete" ON public.message_reactions;
CREATE POLICY "reactions_delete" ON public.message_reactions FOR DELETE USING (user_id IN ('user-azan-001', 'user-sana-002'));

-- Memories
DROP POLICY IF EXISTS "memories_select" ON public.memories;
CREATE POLICY "memories_select" ON public.memories FOR SELECT USING (true);

DROP POLICY IF EXISTS "memories_insert" ON public.memories;
CREATE POLICY "memories_insert" ON public.memories FOR INSERT WITH CHECK (created_by IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "memories_update" ON public.memories;
CREATE POLICY "memories_update" ON public.memories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "memories_delete" ON public.memories;
CREATE POLICY "memories_delete" ON public.memories FOR DELETE USING (created_by IN ('user-azan-001', 'user-sana-002'));

-- Notes
DROP POLICY IF EXISTS "notes_select" ON public.notes;
CREATE POLICY "notes_select" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "notes_insert" ON public.notes;
CREATE POLICY "notes_insert" ON public.notes FOR INSERT WITH CHECK (created_by IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "notes_update" ON public.notes;
CREATE POLICY "notes_update" ON public.notes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "notes_delete" ON public.notes;
CREATE POLICY "notes_delete" ON public.notes FOR DELETE USING (true);

-- Daily Prompts & Answers
DROP POLICY IF EXISTS "prompts_select" ON public.daily_prompts;
CREATE POLICY "prompts_select" ON public.daily_prompts FOR SELECT USING (true);

DROP POLICY IF EXISTS "prompts_insert" ON public.daily_prompts;
CREATE POLICY "prompts_insert" ON public.daily_prompts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "answers_select" ON public.daily_answers;
CREATE POLICY "answers_select" ON public.daily_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "answers_insert" ON public.daily_answers;
CREATE POLICY "answers_insert" ON public.daily_answers FOR INSERT WITH CHECK (user_id IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "answers_update" ON public.daily_answers;
CREATE POLICY "answers_update" ON public.daily_answers FOR UPDATE USING (user_id IN ('user-azan-001', 'user-sana-002'));

-- Bucket List
DROP POLICY IF EXISTS "bucket_select" ON public.bucket_list_items;
CREATE POLICY "bucket_select" ON public.bucket_list_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "bucket_insert" ON public.bucket_list_items;
CREATE POLICY "bucket_insert" ON public.bucket_list_items FOR INSERT WITH CHECK (created_by IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "bucket_update" ON public.bucket_list_items;
CREATE POLICY "bucket_update" ON public.bucket_list_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "bucket_delete" ON public.bucket_list_items;
CREATE POLICY "bucket_delete" ON public.bucket_list_items FOR DELETE USING (true);

-- Special Dates
DROP POLICY IF EXISTS "special_dates_select" ON public.special_dates;
CREATE POLICY "special_dates_select" ON public.special_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "special_dates_insert" ON public.special_dates;
CREATE POLICY "special_dates_insert" ON public.special_dates FOR INSERT WITH CHECK (created_by IN ('user-azan-001', 'user-sana-002'));

DROP POLICY IF EXISTS "special_dates_update" ON public.special_dates;
CREATE POLICY "special_dates_update" ON public.special_dates FOR UPDATE USING (true);

DROP POLICY IF EXISTS "special_dates_delete" ON public.special_dates;
CREATE POLICY "special_dates_delete" ON public.special_dates FOR DELETE USING (true);

-- Kindness Points Policies
ALTER TABLE public.kindness_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kindness_select" ON public.kindness_points;
CREATE POLICY "kindness_select" ON public.kindness_points FOR SELECT USING (true);

DROP POLICY IF EXISTS "kindness_insert" ON public.kindness_points;
CREATE POLICY "kindness_insert" ON public.kindness_points FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "kindness_update" ON public.kindness_points;
CREATE POLICY "kindness_update" ON public.kindness_points FOR UPDATE USING (true);

DROP POLICY IF EXISTS "kindness_delete" ON public.kindness_points;
CREATE POLICY "kindness_delete" ON public.kindness_points FOR DELETE USING (true);

-- ==============================================================================
-- STORAGE CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('memory-images', 'memory-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public image viewing" ON storage.objects;
  CREATE POLICY "Allow public image viewing" ON storage.objects FOR SELECT USING (bucket_id = 'memory-images');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow members to upload images" ON storage.objects;
  CREATE POLICY "Allow members to upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-images');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow members to delete images" ON storage.objects;
  CREATE POLICY "Allow members to delete images" ON storage.objects FOR DELETE USING (bucket_id = 'memory-images');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- REALTIME PUBLICATION
-- ==============================================================================
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.memories; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notes; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_answers; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.bucket_list_items; EXCEPTION WHEN duplicate_object THEN END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.kindness_points; EXCEPTION WHEN duplicate_object THEN END;
END $$;
