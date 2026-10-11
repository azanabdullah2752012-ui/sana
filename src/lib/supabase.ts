import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://vxsushxqhqpjwayadqyj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ZfNh-NKE8udiIfKn0NBJ1g_oFcOSzIN';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

// Check if credentials are properly configured
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

// Supabase client instance with realtime enabled
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : DEFAULT_SUPABASE_URL,
  isSupabaseConfigured() ? supabaseAnonKey : DEFAULT_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Helper to check if tables have been deployed to Supabase
export const checkDatabaseSchemaReady = async (): Promise<{ ready: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) return { ready: false, error: 'Not configured' };
  try {
    const { error } = await supabase.from('authorized_members').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return { ready: false, error: 'Tables not found. Please run supabase/schema.sql in Supabase SQL Editor.' };
      }
      return { ready: false, error: error.message };
    }
    return { ready: true };
  } catch (err: any) {
    return { ready: false, error: err.message };
  }
};
