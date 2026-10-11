import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, checkDatabaseSchemaReady } from '../lib/supabase';
import { UserProfile, AuthorizedMember } from '../types/database';
import { BASE_USER_AZAN, BASE_USER_SANA, BASE_AUTHORIZED_MEMBERS } from '../lib/mockData';
import { useTheme } from './ThemeContext';

const AZAN_PASSCODE = 'azanisthebest';
const SANA_PASSCODE = 'sanaisthebest';

const SESSION_STORAGE_KEY = 'sana_auth_session';

export interface AuthUser {
  id: string;
  display_name: string;
  role: 'member_1' | 'member_2';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  partnerProfile: UserProfile | null;
  authorizedMember: AuthorizedMember | null;
  isApproved: boolean;
  isLoading: boolean;
  isSchemaReady: boolean;
  schemaError: string | null;
  checkSchema: () => Promise<boolean>;
  signInWithPasscode: (passcode: string) => Promise<{ error: Error | null; user?: AuthUser }>;
  signIn: (passcode: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_CACHE_KEY_PREFIX = 'sana_profile_cache_';

function getCachedProfile(userId: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY_PREFIX + userId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function setCachedProfile(userId: string, prof: UserProfile) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY_PREFIX + userId, JSON.stringify(prof));
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setThemePreference, setAccentColor } = useTheme();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [authorizedMember, setAuthorizedMember] = useState<AuthorizedMember | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSchemaReady, setIsSchemaReady] = useState<boolean>(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  const checkSchema = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsSchemaReady(true);
      setSchemaError(null);
      return true;
    }
    const res = await checkDatabaseSchemaReady();
    setIsSchemaReady(res.ready);
    setSchemaError(res.ready ? null : res.error || 'Database tables not found');
    return res.ready;
  }, []);

  const loadUserDataForRole = useCallback(async (role: 'member_1' | 'member_2') => {
    const isAzan = role === 'member_1';
    const currentBase = isAzan ? BASE_USER_AZAN : BASE_USER_SANA;
    const partnerBase = isAzan ? BASE_USER_SANA : BASE_USER_AZAN;
    const authRecord = isAzan ? BASE_AUTHORIZED_MEMBERS[0] : BASE_AUTHORIZED_MEMBERS[1];

    // 1. Immediately hydrate from local persistent cache (0ms delay, no reset!)
    const cachedUser = getCachedProfile(currentBase.id);
    const cachedPartner = getCachedProfile(partnerBase.id);

    const initialProfile: UserProfile = cachedUser || currentBase;
    const initialPartner: UserProfile = cachedPartner || partnerBase;

    const authUser: AuthUser = {
      id: currentBase.id,
      display_name: initialProfile.display_name || currentBase.display_name,
      role,
    };

    setUser(authUser);
    setProfile(initialProfile);
    setPartnerProfile(initialPartner);
    setAuthorizedMember(authRecord);
    setIsApproved(true);

    if (initialProfile.theme_preference) {
      setThemePreference(initialProfile.theme_preference);
    }
    if (initialProfile.accent_color) {
      setAccentColor(initialProfile.accent_color);
    }

    // 2. Fetch latest live profile from Supabase and synchronize
    if (isSupabaseConfigured()) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentBase.id)
          .maybeSingle();

        if (dbProfile) {
          const loaded = dbProfile as UserProfile;
          // Merge safely: preserve local custom avatar/bio if Supabase returned empty/null
          const resolvedAvatar = loaded.avatar_url ?? cachedUser?.avatar_url ?? null;
          const resolvedBio = loaded.bio !== undefined && loaded.bio !== null && loaded.bio !== ''
            ? loaded.bio
            : (cachedUser?.bio || '');

          const merged: UserProfile = {
            ...loaded,
            avatar_url: resolvedAvatar,
            bio: resolvedBio,
          };

          setProfile(merged);
          setCachedProfile(currentBase.id, merged);

          // If local has custom avatar but DB was empty, sync it up to DB
          if (!loaded.avatar_url && cachedUser?.avatar_url) {
            supabase
              .from('profiles')
              .update({ avatar_url: cachedUser.avatar_url })
              .eq('id', currentBase.id)
              .then(() => {});
          }

          if (merged.theme_preference) {
            setThemePreference(merged.theme_preference);
          }
          if (merged.accent_color) {
            setAccentColor(merged.accent_color);
          }
        }

        // Fetch partner profile from Supabase
        const { data: dbPartner } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerBase.id)
          .maybeSingle();

        if (dbPartner) {
          const loadedPartner = dbPartner as UserProfile;
          const mergedPartner: UserProfile = {
            ...loadedPartner,
            avatar_url: loadedPartner.avatar_url ?? cachedPartner?.avatar_url ?? null,
            bio: loadedPartner.bio ?? cachedPartner?.bio ?? '',
          };
          setPartnerProfile(mergedPartner);
          setCachedProfile(partnerBase.id, mergedPartner);
        }
      } catch (e) {
        console.warn('Profile fetch warning:', e);
      }
    }
  }, [setThemePreference, setAccentColor]);

  // Initialize session from localStorage or verify Supabase
  useEffect(() => {
    const init = async () => {
      if (isSupabaseConfigured()) {
        await checkSchema();
      }

      // Check saved passcode session
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const { passcode } = JSON.parse(savedSession);
          if (passcode === AZAN_PASSCODE) {
            await loadUserDataForRole('member_1');
          } else if (passcode === SANA_PASSCODE) {
            await loadUserDataForRole('member_2');
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } catch (e) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [checkSchema, loadUserDataForRole]);

  // Sign in with secret passcode
  const signInWithPasscode = async (passcode: string): Promise<{ error: Error | null; user?: AuthUser }> => {
    const trimmed = passcode.trim();

    if (trimmed === AZAN_PASSCODE) {
      await loadUserDataForRole('member_1');
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ passcode: AZAN_PASSCODE }));
      return {
        error: null,
        user: { id: BASE_USER_AZAN.id, display_name: 'Azan', role: 'member_1' },
      };
    }

    if (trimmed === SANA_PASSCODE) {
      await loadUserDataForRole('member_2');
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ passcode: SANA_PASSCODE }));
      return {
        error: null,
        user: { id: BASE_USER_SANA.id, display_name: 'Sana', role: 'member_2' },
      };
    }

    return {
      error: new Error('Incorrect secret passcode. Access denied 🌸'),
    };
  };

  const signIn = async (passcode: string) => {
    const { error } = await signInWithPasscode(passcode);
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setProfile(null);
    setPartnerProfile(null);
    setAuthorizedMember(null);
    setIsApproved(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!profile) return { error: new Error('No active profile') };

    // 1. Immediately apply theme and accent to ThemeContext & DOM & localStorage
    if (updates.theme_preference) {
      setThemePreference(updates.theme_preference);
    }
    if (updates.accent_color) {
      setAccentColor(updates.accent_color);
    }

    const updated = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setProfile(updated);
    setCachedProfile(profile.id, updated);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: updated.display_name,
            avatar_url: updated.avatar_url,
            bio: updated.bio,
            theme_preference: updated.theme_preference,
            accent_color: updated.accent_color,
            updated_at: updated.updated_at,
          })
          .eq('id', profile.id);

        if (error) {
          // If Supabase table has the old 3-color check constraint (profiles_accent_color_check),
          // fallback to updating non-accent fields in Supabase so display name/photo/bio still succeed!
          if (
            error.message &&
            (error.message.includes('profiles_accent_color_check') ||
              error.message.includes('check constraint'))
          ) {
            console.warn(
              'Supabase constraint profiles_accent_color_check active. Falling back to non-accent fields in DB; chosen theme preserved locally.'
            );
            const fallbackRes = await supabase
              .from('profiles')
              .update({
                display_name: updated.display_name,
                avatar_url: updated.avatar_url,
                bio: updated.bio,
                theme_preference: updated.theme_preference,
                updated_at: updated.updated_at,
              })
              .eq('id', profile.id);

            return { error: fallbackRes.error ? new Error(fallbackRes.error.message) : null };
          }

          return { error: new Error(error.message) };
        }

        return { error: null };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        partnerProfile,
        authorizedMember,
        isApproved,
        isLoading,
        isSchemaReady,
        schemaError,
        checkSchema,
        signInWithPasscode,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
