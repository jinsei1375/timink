import { supabase } from '@/lib/supabase';
import { Profile, SignInData, SignUpData } from '@/types/index';
import { generateUserId } from '@/utils/generateUserId';
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
    const userIdString = generateUserId();

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      user_id: userIdString,
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
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 更新するフィールドのみを含める
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.user_id !== undefined) updateData.user_id = updates.user_id;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ プロフィール更新エラー:', error);
      throw error;
    }

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
