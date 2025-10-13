import { supabase } from '@/lib/supabase';
import { Profile, SignInData, SignUpData } from '@/types/index';
import { AuthError, AuthResponse, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';

export class AuthService {
  /**
   * メールアドレスとパスワードでサインアップ
   */
  static async signUp({ email, password, displayName }: SignUpData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'timink://auth/callback',
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // メール確認が有効な場合、確認後にプロフィールが作成される
    // メール確認が無効な場合のみ、ここでプロフィールを作成
    if (data.user && data.user.email_confirmed_at) {
      await this.createProfile(data.user.id, displayName || null);
    }

    return { data, error };
  }

  /**
   * メールアドレスとパスワードでサインイン
   */
  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error };
  }

  /**
   * Google OAuth サインイン
   */
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'timink://auth/callback',
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    // OAuth URLをブラウザで開く
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, 'timink://auth/callback');
    }

    return { data, error };
  }

  /**
   * サインアウト
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * 現在のユーザー取得
   */
  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  /**
   * セッション取得
   */
  static async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  }

  /**
   * プロフィール作成
   */
  static async createProfile(userId: string, displayName: string | null): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      display_name: displayName,
      avatar_url: null,
      bio: null,
    });

    if (error) {
      console.error('❌ プロフィール作成エラー:', error);
      throw error;
    }
  }

  /**
   * プロフィール取得
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ プロフィール取得エラー:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ プロフィール取得例外:', error);
      throw error;
    }
  }

  /**
   * プロフィール更新
   */
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.display_name,
        avatar_url: updates.avatar_url,
        bio: updates.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * パスワードリセット
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'timink://auth/reset-password',
    });
    return { error };
  }
}
