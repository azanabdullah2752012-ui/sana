export type UserRole = 'member_1' | 'member_2';
export type ThemePreference = 'light' | 'dark' | 'system';
export type AccentColor = 'blush' | 'lavender' | 'cream';

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  theme_preference: ThemePreference;
  accent_color: AccentColor;
  created_at: string;
  updated_at: string;
}

export interface AuthorizedMember {
  id: string;
  user_id: string | null;
  email?: string;
  display_name: string;
  role: UserRole;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user_name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  reply_to_id?: string | null;
  reply_to?: {
    id: string;
    sender_name: string;
    content: string;
  } | null;
  is_edited: boolean;
  edited_at?: string | null;
  created_at: string;
  reactions: MessageReaction[];
  sender?: UserProfile;
}

export interface Memory {
  id: string;
  created_by: string;
  title: string;
  description: string;
  memory_date: string; // YYYY-MM-DD
  image_url?: string | null;
  location?: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  creator?: UserProfile;
}

export type NoteCategory = 'general' | 'idea' | 'reminder' | 'inside_joke' | 'later';
export type NoteColor = 'blush' | 'lavender' | 'cream' | 'mint' | 'peach';

export interface SharedNote {
  id: string;
  created_by: string;
  last_edited_by: string;
  title: string;
  content: string;
  category: NoteCategory;
  is_pinned: boolean;
  color_tag: NoteColor;
  created_at: string;
  updated_at: string;
  creator?: UserProfile;
  last_editor?: UserProfile;
}

export interface DailyPrompt {
  id: string;
  prompt_date: string; // YYYY-MM-DD
  question: string;
  category: string;
  created_at: string;
}

export interface DailyAnswer {
  id: string;
  prompt_id: string;
  user_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export type BucketCategory = 'adventure' | 'food' | 'travel' | 'relax' | 'creative' | 'cozy';

export interface BucketListItem {
  id: string;
  created_by: string;
  title: string;
  notes?: string | null;
  category: BucketCategory;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  target_date?: string | null;
  created_at: string;
  creator?: UserProfile;
}

export type SpecialDateCategory = 'birthday' | 'anniversary' | 'trip' | 'milestone' | 'reminder';

export interface SpecialDate {
  id: string;
  created_by: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  description?: string | null;
  category: SpecialDateCategory;
  is_recurring_yearly: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  enabled_widgets: {
    daily_prompt: boolean;
    countdown: boolean;
    question_generator: boolean;
    bucket_list: boolean;
    recent_memories: boolean;
    pinned_notes: boolean;
  };
  updated_at: string;
}
