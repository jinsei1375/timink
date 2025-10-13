import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/authService';
import { AuthState, Profile } from '@/types/index';
import { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    // 認証状態変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (user: User) => {
    try {
      let profile = await AuthService.getProfile(user.id);

      // プロフィールが存在しない場合、作成する
      if (!profile && user.user_metadata?.display_name) {
        await AuthService.createProfile(user.id, user.user_metadata.display_name);
        profile = await AuthService.getProfile(user.id);
      }

      setState({
        user,
        profile,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      setState({
        user,
        profile: null,
        loading: false,
        error: error instanceof Error ? error.message : 'プロフィール取得エラー',
      });
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await AuthService.signUp({ email, password, displayName });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await AuthService.signIn({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const result = await AuthService.signInWithGoogle();
    if (result.error) throw result.error;
  };

  const signOut = async () => {
    const { error } = await AuthService.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) throw new Error('ユーザーがログインしていません');

    const updatedProfile = await AuthService.updateProfile(state.user.id, updates);
    setState((prev) => ({
      ...prev,
      profile: updatedProfile,
    }));
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
