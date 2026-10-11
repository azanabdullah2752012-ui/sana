-- ==============================================================================
-- SANA & ME — Seed Data for Azan and Sana
-- ==============================================================================
-- Run this in your Supabase SQL Editor right after running schema.sql!
-- ==============================================================================

-- 1. Initial Welcome Messages in Chat
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
VALUES 
  (
    'msg-welcome-01',
    '00000000-0000-0000-0000-000000000001',
    'user-azan-001',
    'Hey Sana! Welcome to our private little nook. How do you like this cozy design?',
    now() - interval '4 hours'
  ),
  (
    'msg-welcome-02',
    '00000000-0000-0000-0000-000000000001',
    'user-sana-002',
    'Azan! It is absolutely gorgeous!! The warm cream colors and blush tones feel so calm and personal. ✨',
    now() - interval '3 hours'
  ),
  (
    'msg-welcome-03',
    '00000000-0000-0000-0000-000000000001',
    'user-azan-001',
    'I uploaded our cafe photos from last Sunday to the scrapbook too! Check out the Memories tab when you get a chance.',
    now() - interval '2 hours'
  ),
  (
    'msg-welcome-04',
    '00000000-0000-0000-0000-000000000001',
    'user-sana-002',
    'Just saw them! That strawberry cheesecake photo is iconic. Also, don’t forget we have our weekend picnic coming up!',
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- Initial message reactions
INSERT INTO public.message_reactions (id, message_id, user_id, emoji)
VALUES
  ('react-welcome-01', 'msg-welcome-01', 'user-sana-002', '🌸'),
  ('react-welcome-02', 'msg-welcome-01', 'user-azan-001', '☕'),
  ('react-welcome-03', 'msg-welcome-02', 'user-azan-001', '💖')
ON CONFLICT (id) DO NOTHING;

-- 2. Initial Memories in Scrapbook
INSERT INTO public.memories (id, created_by, title, description, memory_date, image_url, location, tags, is_favorite)
VALUES
  (
    'mem-001',
    'user-sana-002',
    'Rainy Afternoon & Matcha Latte',
    'We sat by the wooden window listening to the gentle rain, chatting for hours about everything and nothing. The warm pastry and hazelnut matcha made it perfection.',
    '2024-09-18',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
    'Little Fern Cafe',
    ARRAY['cafe', 'rainy day', 'coffee'],
    true
  ),
  (
    'mem-002',
    'user-azan-001',
    'Golden Hour at the Botanical Garden',
    'Walking under the giant eucalyptus trees and stumbling across the blooming lavender field. The golden hour lighting was unreal!',
    '2024-10-02',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    'City Conservatory Gardens',
    ARRAY['walk', 'sunset', 'flowers'],
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Shared Notes
INSERT INTO public.notes (id, created_by, last_edited_by, title, content, category, is_pinned, color_tag)
VALUES
  (
    'note-001',
    'user-sana-002',
    'user-azan-001',
    'Picnic Essentials Checklist 🧺',
    '• Woven picnic blanket (the waterproof one)\n• Peach sparkling water & iced tea\n• Fresh croissants from bakery around the corner\n• Polaroid camera with fresh film cartridges\n• Our reading books + card games',
    'reminder',
    true,
    'blush'
  ),
  (
    'note-002',
    'user-azan-001',
    'user-azan-001',
    'The Legendary Lemon Tart Incident 🍋',
    'Never forget when Sana ordered "just one small bite" of the lemon tart and ended up devouring 90% of it before I even unpacked my fork. The face of pure innocent satisfaction was priceless!',
    'inside_joke',
    true,
    'cream'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Bucket List Items
INSERT INTO public.bucket_list_items (id, created_by, title, notes, category, is_completed)
VALUES
  ('bucket-001', 'user-azan-001', 'Watch the sunrise from the lighthouse cliff', 'Bring a thermos of hot cocoa and warm blankets', 'adventure', true),
  ('bucket-002', 'user-sana-002', 'Ceramics & pottery wheel workshop together', 'Make matching handmade coffee mugs for our mornings', 'creative', false),
  ('bucket-003', 'user-azan-001', 'Road trip to the apple orchard in autumn', 'Bake a warm homemade cinnamon apple pie afterwards', 'food', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Special Dates & Countdowns
INSERT INTO public.special_dates (id, created_by, title, event_date, description, category, is_recurring_yearly)
VALUES
  ('date-001', 'user-azan-001', 'Sana''s Birthday 🎂', '2026-11-20', 'Celebrate Sana with her favorite lavender cake and flowers!', 'birthday', true),
  ('date-002', 'user-sana-002', 'Friendship Anniversary 🌸', '2026-12-14', 'The day we first met and talked about art for 4 hours straight.', 'anniversary', true)
ON CONFLICT (id) DO NOTHING;
