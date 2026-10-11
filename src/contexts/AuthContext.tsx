import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, checkDatabaseSchemaReady } from '../lib/supabase';
import { UserProfile, AuthorizedMember } from '../types/database';
import { BASE_USER_AZAN, BASE_USER_SANA, BASE_AUTHORIZED_MEMBERS } from '../lib/mockData';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    const authUser: AuthUser = {
      id: currentBase.id,
      display_name: currentBase.display_name,
      role,
    };

    setUser(authUser);
    setAuthorizedMember(authRecord);
    setIsApproved(true);

    if (isSupabaseConfigured()) {
      try {
        // Fetch current user profile from Supabase
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentBase.id)
          .maybeSingle();

        if (dbProfile) {
          setProfile(dbProfile as UserProfile);
        } else {
          setProfile(currentBase);
        }

        // Fetch partner profile from Supabase
        const { data: dbPartner } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerBase.id)
          .maybeSingle();

        if (dbPartner) {
          setPartnerProfile(dbPartner as UserProfile);
        } else {
          setPartnerProfile(partnerBase);
        }
      } catch (e) {
        setProfile(currentBase);
        setPartnerProfile(partnerBase);
      }
    } else {
      setProfile(currentBase);
      setPartnerProfile(partnerBase);
    }
  }, []);

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

    const updated = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setProfile(updated);

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

        return { error };
      } catch (err: any) {
        return { error: err };
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
