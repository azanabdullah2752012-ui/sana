import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are properly configured (not empty and not default placeholders)
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) return false;
  try {
    new URL(supabaseUrl);
    return true;
  } catch {
    return false;
  }
};

// Fallback dummy client if credentials aren't provided yet so code doesn't crash on load
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://dummy-placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'dummy-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
