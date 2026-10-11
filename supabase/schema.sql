-- ==============================================================================
-- SANA & ME — Production Supabase Schema & Security Setup
-- ==============================================================================
-- Description:
-- Strict 2-person access control schema with Row Level Security (RLS),
-- Realtime subscriptions, Storage security, and automated triggers.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AUTHORIZED MEMBERS TABLE (Whitelist for the exactly two users)
-- Only users listed in this table with is_approved = true can access any private data.
CREATE TABLE IF NOT EXISTS public.authorized_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('member_1', 'member_2')),
  is_approved boolean DEFAULT false,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Maximum 2 members constraint via trigger
CREATE OR REPLACE FUNCTION public.check_max_authorized_members()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM public.authorized_members) >= 2 AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Access restricted: Only 2 authorized members are permitted in this space.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_members ON public.authorized_members;
CREATE TRIGGER tr_check_max_members
  BEFORE INSERT ON public.authorized_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_authorized_members();

-- Security Definer helper function to check if a user is an approved member
-- Runs with privileges of creator to check authorized_members safely without RLS recursion
CREATE OR REPLACE FUNCTION public.is_approved_member(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_members
    WHERE user_id = check_user_id
      AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to check if email is in the pre-authorized whitelist
CREATE OR REPLACE FUNCTION public.is_preauthorized_email(check_email text)
RETURNS boolean AS $$
BEGIN
  IF check_email IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.authorized_members
    WHERE lower(email) = lower(check_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text DEFAULT 'Sharing cozy memories & little moments ☕✨',
  theme_preference text DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  accent_color text DEFAULT 'blush' CHECK (accent_color IN ('blush', 'lavender', 'cream')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. CONVERSATIONS & CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT 'Sana & Me',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- 5. SHARED MEMORIES (Scrapbook)
CREATE TABLE IF NOT EXISTS public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_edited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  question text NOT NULL,
  category text DEFAULT 'cozy',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES public.daily_prompts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);

-- 8. SHARED BUCKET LIST / THINGS TO DO TOGETHER
CREATE TABLE IF NOT EXISTS public.bucket_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  notes text,
  category text DEFAULT 'adventure' CHECK (category IN ('adventure', 'food', 'travel', 'relax', 'creative', 'cozy')),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_date date,
  created_at timestamptz DEFAULT now()
);

-- 9. SPECIAL DATES & COUNTDOWNS
CREATE TABLE IF NOT EXISTS public.special_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_date date NOT NULL,
  description text,
  category text DEFAULT 'milestone' CHECK (category IN ('birthday', 'anniversary', 'trip', 'milestone', 'reminder')),
  is_recurring_yearly boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 10. USER WIDGET PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_widgets jsonb DEFAULT '{"daily_prompt": true, "countdown": true, "question_generator": true, "bucket_list": true, "recent_memories": true, "pinned_notes": true}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.memories(memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned_updated ON public.notes(is_pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_answers_prompt ON public.daily_answers(prompt_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_completed ON public.bucket_list_items(is_completed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_special_dates ON public.special_dates(event_date ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.authorized_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. AUTHORIZED MEMBERS POLICIES
-- Authenticated users can view authorized members if they are approved, OR to check their own status
CREATE POLICY "authorized_members_select" ON public.authorized_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR public.is_approved_member(auth.uid())
  );

-- Clients cannot insert, update, or delete authorized members (prevents unauthorized self-elevation)
-- Only service_role or DB administrators can modify this table.
CREATE POLICY "authorized_members_no_client_write" ON public.authorized_members
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "authorized_members_no_client_update" ON public.authorized_members
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "authorized_members_no_client_delete" ON public.authorized_members
  FOR DELETE TO authenticated
  USING (false);

-- 2. PROFILES POLICIES
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_approved_member(auth.uid()));

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. CONVERSATIONS POLICIES
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_member(auth.uid()));

-- 4. MESSAGES POLICIES
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    sender_id = auth.uid()
  );

CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    public.is_approved_member(auth.uid()) AND
    sender_id = auth.uid()
  )
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    sender_id = auth.uid()
  );

CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE TO authenticated
  USING (
    public.is_approved_member(auth.uid()) AND
    sender_id = auth.uid()
  );

-- 5. MESSAGE REACTIONS POLICIES
CREATE POLICY "reactions_select" ON public.message_reactions
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "reactions_insert" ON public.message_reactions
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    user_id = auth.uid()
  );

CREATE POLICY "reactions_delete" ON public.message_reactions
  FOR DELETE TO authenticated
  USING (
    public.is_approved_member(auth.uid()) AND
    user_id = auth.uid()
  );

-- 6. MEMORIES POLICIES
CREATE POLICY "memories_select" ON public.memories
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "memories_insert" ON public.memories
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "memories_update" ON public.memories
  FOR UPDATE TO authenticated
  USING (public.is_approved_member(auth.uid()))
  WITH CHECK (public.is_approved_member(auth.uid()));

CREATE POLICY "memories_delete" ON public.memories
  FOR DELETE TO authenticated
  USING (
    public.is_approved_member(auth.uid()) AND
    (created_by = auth.uid() OR public.is_approved_member(auth.uid()))
  );

-- 7. NOTES POLICIES (Collaborative - both can edit)
CREATE POLICY "notes_select" ON public.notes
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "notes_update" ON public.notes
  FOR UPDATE TO authenticated
  USING (public.is_approved_member(auth.uid()))
  WITH CHECK (public.is_approved_member(auth.uid()));

CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE TO authenticated
  USING (public.is_approved_member(auth.uid()));

-- 8. DAILY PROMPTS & ANSWERS POLICIES
CREATE POLICY "prompts_select" ON public.daily_prompts
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "prompts_insert" ON public.daily_prompts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_approved_member(auth.uid()));

CREATE POLICY "answers_select" ON public.daily_answers
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "answers_insert" ON public.daily_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    user_id = auth.uid()
  );

CREATE POLICY "answers_update" ON public.daily_answers
  FOR UPDATE TO authenticated
  USING (
    public.is_approved_member(auth.uid()) AND
    user_id = auth.uid()
  );

-- 9. BUCKET LIST POLICIES
CREATE POLICY "bucket_list_select" ON public.bucket_list_items
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "bucket_list_insert" ON public.bucket_list_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "bucket_list_update" ON public.bucket_list_items
  FOR UPDATE TO authenticated
  USING (public.is_approved_member(auth.uid()))
  WITH CHECK (public.is_approved_member(auth.uid()));

CREATE POLICY "bucket_list_delete" ON public.bucket_list_items
  FOR DELETE TO authenticated
  USING (public.is_approved_member(auth.uid()));

-- 10. SPECIAL DATES POLICIES
CREATE POLICY "special_dates_select" ON public.special_dates
  FOR SELECT TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "special_dates_insert" ON public.special_dates
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_approved_member(auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "special_dates_update" ON public.special_dates
  FOR UPDATE TO authenticated
  USING (public.is_approved_member(auth.uid()));

CREATE POLICY "special_dates_delete" ON public.special_dates
  FOR DELETE TO authenticated
  USING (public.is_approved_member(auth.uid()));

-- 11. USER PREFERENCES POLICIES
CREATE POLICY "preferences_select" ON public.user_preferences
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "preferences_upsert" ON public.user_preferences
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ==============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Function: Automatically create profile and connect authorized_member on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_display_name text;
  v_is_preapproved boolean;
BEGIN
  -- Determine display name
  v_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- 1. Create user profile
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

  -- 2. Create default widget preferences
  INSERT INTO public.user_preferences (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  -- 3. If user's email matches an authorized_member record, link user_id and approve!
  UPDATE public.authorized_members
  SET user_id = new.id,
      is_approved = true,
      approved_at = now()
  WHERE lower(email) = lower(new.email)
    AND (user_id IS NULL OR user_id = new.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_memories_updated_at BEFORE UPDATE ON public.memories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_daily_answers_updated_at BEFORE UPDATE ON public.daily_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- STORAGE CONFIGURATION & POLICIES (Private Bucket 'memory-images')
-- ==============================================================================
-- Note: Insert bucket if storage schema exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'memory-images',
  'memory-images',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- Storage RLS Policies: Only approved members can view, upload, update, or delete memory images
CREATE POLICY "Approved members can read memory images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'memory-images' AND
    public.is_approved_member(auth.uid())
  );

CREATE POLICY "Approved members can upload memory images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'memory-images' AND
    public.is_approved_member(auth.uid())
  );

CREATE POLICY "Approved members can update memory images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'memory-images' AND
    public.is_approved_member(auth.uid())
  );

CREATE POLICY "Approved members can delete memory images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'memory-images' AND
    public.is_approved_member(auth.uid())
  );

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Enable Realtime publication for chat, reactions, memories, and notes
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_answers;
  EXCEPTION WHEN duplicate_object THEN END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bucket_list_items;
  EXCEPTION WHEN duplicate_object THEN END;
END $$;
