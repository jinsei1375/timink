import { supabase } from '@/lib/supabase';
import { DiaryEntry, Profile } from '@/types';

// 交換日記と最新エントリー、メンバー情報を含む型
export interface DiaryWithDetails {
  id: string;
  title: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: Profile[];
  latest_entry?: DiaryEntry & { author: Profile };
  unread_count: number;
}

export class DiaryService {
  /**
   * 自分が参加している交換日記一覧を取得
   */
  static async getMyDiaries(): Promise<DiaryWithDetails[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      // 自分が参加している日記のIDを取得
      const { data: memberships, error: membershipError } = await supabase
        .from('diary_members')
        .select('diary_id')
        .eq('profile_id', user.id);

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      const diaryIds = memberships.map((m) => m.diary_id);

      // 日記情報を取得
      const { data: diaries, error: diariesError } = await supabase
        .from('diaries')
        .select('*')
        .in('id', diaryIds)
        .order('updated_at', { ascending: false });

      if (diariesError) throw diariesError;
      if (!diaries) return [];

      // 各日記のメンバーと最新エントリーを取得
      const diariesWithDetails = await Promise.all(
        diaries.map(async (diary) => {
          // メンバー情報取得
          const { data: members } = await supabase
            .from('diary_members')
            .select('profile:profiles(*)')
            .eq('diary_id', diary.id);

          // 最新エントリー取得
          const { data: latestEntry } = await supabase
            .from('diary_entries')
            .select('*, author:profiles(*)')
            .eq('diary_id', diary.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...diary,
            members: members?.map((m: any) => m.profile) || [],
            latest_entry: latestEntry || undefined,
            unread_count: 0, // 未読数は後で実装
          };
        })
      );

      return diariesWithDetails;
    } catch (error) {
      console.error('❌ 交換日記一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * 新しい交換日記を作成
   */
  static async createDiary(title: string, friendIds: string[]) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      // 日記作成
      const { data: diary, error: diaryError } = await supabase
        .from('diaries')
        .insert({
          title,
          is_group: friendIds.length > 1,
          created_by: user.id,
        })
        .select()
        .single();

      if (diaryError) throw diaryError;

      // メンバー追加（自分 + 友達）
      const memberIds = [user.id, ...friendIds];
      const { error: membersError } = await supabase.from('diary_members').insert(
        memberIds.map((profileId) => ({
          diary_id: diary.id,
          profile_id: profileId,
        }))
      );

      if (membersError) throw membersError;

      return { success: true, data: diary, error: null };
    } catch (error: any) {
      console.error('❌ 交換日記作成エラー:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * 交換日記の詳細を取得
   */
  static async getDiaryDetail(diaryId: string) {
    try {
      const { data: diary, error: diaryError } = await supabase
        .from('diaries')
        .select('*')
        .eq('id', diaryId)
        .single();

      if (diaryError) throw diaryError;

      // メンバー取得
      const { data: members } = await supabase
        .from('diary_members')
        .select('profile:profiles(*)')
        .eq('diary_id', diaryId);

      // エントリー一覧取得
      const { data: entries } = await supabase
        .from('diary_entries')
        .select('*, author:profiles(*)')
        .eq('diary_id', diaryId)
        .order('posted_date', { ascending: false });

      return {
        success: true,
        data: {
          ...diary,
          members: members?.map((m: any) => m.profile) || [],
          entries: entries || [],
        },
        error: null,
      };
    } catch (error: any) {
      console.error('❌ 交換日記詳細取得エラー:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * 新しいエントリーを投稿
   */
  static async createEntry(diaryId: string, content: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          diary_id: diaryId,
          author_id: user.id,
          content,
          posted_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // 日記のupdated_atを更新
      await supabase
        .from('diaries')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', diaryId);

      return { success: true, data, error: null };
    } catch (error: any) {
      console.error('❌ エントリー作成エラー:', error);
      return { success: false, data: null, error };
    }
  }
}
