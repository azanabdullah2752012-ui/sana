import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AuthorizedMember } from '../types/database';
import { MOCK_USER_AZAN, MOCK_USER_SANA, MOCK_AUTHORIZED_MEMBERS } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  partnerProfile: UserProfile | null;
  authorizedMember: AuthorizedMember | null;
  isApproved: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null; needsApproval?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  switchDemoUser: (userType: 'azan' | 'sana' | 'unauthorized') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [authorizedMember, setAuthorizedMember] = useState<AuthorizedMember | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Track whether we are running in mock demo mode
  const [isMockMode, setIsMockMode] = useState<boolean>(!isSupabaseConfigured());
  const [mockCurrentUserId, setMockCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('sana_mock_current_user') || MOCK_USER_AZAN.id;
  });

  // Load profiles and authorization details for Supabase user
  const loadSupabaseUserData = useCallback(async (supabaseUser: User) => {
    try {
      // 1. Check if user is in authorized_members and approved
      const { data: memberData, error: memberErr } = await supabase
        .from('authorized_members')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (memberErr) {
        console.warn('Error checking authorized_members:', memberErr);
      }

      if (memberData && memberData.is_approved) {
        setIsApproved(true);
        setAuthorizedMember(memberData);
      } else {
        // Double check by email in case user_id wasn't linked yet
        const { data: memberByEmail } = await supabase
          .from('authorized_members')
          .select('*')
          .ilike('email', supabaseUser.email || '')
          .maybeSingle();

        if (memberByEmail && memberByEmail.is_approved) {
          setIsApproved(true);
          setAuthorizedMember(memberByEmail);
        } else {
          setIsApproved(false);
          setAuthorizedMember(null);
        }
      }

      // 2. Fetch current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        // Fallback default profile if not yet created by trigger
        const defaultProfile: UserProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          display_name: supabaseUser.user_metadata?.display_name || supabaseUser.email?.split('@')[0] || 'Friend',
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          bio: 'Cozy memories & little moments ☕✨',
          theme_preference: 'light',
          accent_color: 'blush',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(defaultProfile);
      }

      // 3. Fetch partner profile (the other approved member)
      const { data: otherMembers } = await supabase
        .from('authorized_members')
        .select('user_id')
        .neq('user_id', supabaseUser.id)
        .eq('is_approved', true)
        .maybeSingle();

      if (otherMembers?.user_id) {
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherMembers.user_id)
          .maybeSingle();

        if (partnerData) {
          setPartnerProfile(partnerData as UserProfile);
        }
      }
    } catch (err) {
      console.error('Failed to load user authorization:', err);
      setIsApproved(false);
    }
  }, []);

  // Setup Supabase or Mock initialization
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Running in Mock Mode
      setIsMockMode(true);
      applyMockUser(mockCurrentUserId);
      setIsLoading(false);
      return;
    }

    // Running in Real Supabase Mode
    setIsMockMode(false);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadSupabaseUserData(currentSession.user).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await loadSupabaseUserData(newSession.user);
      } else {
        setProfile(null);
        setPartnerProfile(null);
        setAuthorizedMember(null);
        setIsApproved(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSupabaseUserData, mockCurrentUserId]);

  const applyMockUser = (mockId: string) => {
    if (mockId === 'unauthorized') {
      setUser({
        id: 'unauthorized-user-999',
        app_metadata: {},
        user_metadata: { display_name: 'Visitor' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'stranger@example.com',
      } as User);
      setProfile({
        id: 'unauthorized-user-999',
        email: 'stranger@example.com',
        display_name: 'Visitor',
        avatar_url: null,
        bio: null,
        theme_preference: 'light',
        accent_color: 'cream',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setAuthorizedMember(null);
      setIsApproved(false);
      setPartnerProfile(null);
      return;
    }

    const isAzan = mockId === MOCK_USER_AZAN.id;
    const current = isAzan ? MOCK_USER_AZAN : MOCK_USER_SANA;
    const partner = isAzan ? MOCK_USER_SANA : MOCK_USER_AZAN;
    const authRecord = isAzan ? MOCK_AUTHORIZED_MEMBERS[0] : MOCK_AUTHORIZED_MEMBERS[1];

    setUser({
      id: current.id,
      app_metadata: {},
      user_metadata: { display_name: current.display_name },
      aud: 'authenticated',
      created_at: current.created_at,
      email: current.email,
    } as User);

    setProfile(current);
    setPartnerProfile(partner);
    setAuthorizedMember(authRecord);
    setIsApproved(true);
  };

  const switchDemoUser = (userType: 'azan' | 'sana' | 'unauthorized') => {
    let newId = MOCK_USER_AZAN.id;
    if (userType === 'sana') newId = MOCK_USER_SANA.id;
    if (userType === 'unauthorized') newId = 'unauthorized';

    setMockCurrentUserId(newId);
    localStorage.setItem('sana_mock_current_user', newId);
    applyMockUser(newId);
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (isMockMode) {
      if (email.toLowerCase().includes('sana')) {
        switchDemoUser('sana');
      } else if (email.toLowerCase().includes('azan')) {
        switchDemoUser('azan');
      } else {
        switchDemoUser('unauthorized');
      }
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error };
      if (data.user) {
        await loadSupabaseUserData(data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ error: Error | null; needsApproval?: boolean }> => {
    if (isMockMode) {
      // In mock mode, pretend user signed up
      const isPreApproved =
        email.toLowerCase().includes('sana') || email.toLowerCase().includes('azan');
      if (isPreApproved) {
        if (email.toLowerCase().includes('sana')) switchDemoUser('sana');
        else switchDemoUser('azan');
        return { error: null, needsApproval: false };
      } else {
        switchDemoUser('unauthorized');
        return { error: null, needsApproval: true };
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        await loadSupabaseUserData(data.user);
      }

      return { error: null, needsApproval: !isApproved };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isMockMode) {
      setUser(null);
      setProfile(null);
      setPartnerProfile(null);
      setIsApproved(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPartnerProfile(null);
    setIsApproved(false);
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    if (isMockMode) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: Error | null }> => {
    if (!profile) return { error: new Error('No active profile') };

    const updated = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    setProfile(updated);

    if (isMockMode) {
      // Mock mode: update local profile
      return { error: null };
    }

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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        partnerProfile,
        authorizedMember,
        isApproved,
        isLoading,
        isMockMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        switchDemoUser,
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
