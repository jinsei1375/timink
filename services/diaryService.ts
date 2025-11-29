import { supabase } from '@/lib/supabase';
import { NotificationService } from '@/services/notificationService';
import { DiaryEntry, DiaryType, Profile } from '@/types';

// 交換日記と最新エントリー、メンバー情報を含む型
export interface DiaryWithDetails {
  id: string;
  title: string;
  is_group: boolean;
  diary_type: DiaryType;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: Profile[];
  latest_entry?: DiaryEntry & { author: Profile };
  unread_count: number;
  is_pinned: boolean;
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

      // 1. 自分の参加情報(diary_members)を起点に、日記情報(diaries)とメンバー(members)を一括取得
      // これによりクエリ回数を大幅に削減
      const { data: memberships, error } = await supabase
        .from('diary_members')
        .select(
          `
          is_pinned,
          diary:diaries!inner(
            *,
            members:diary_members(
              profile:profiles(*)
            )
          )
        `
        )
        .eq('profile_id', user.id)
        .order('updated_at', { foreignTable: 'diary', ascending: false });

      if (error) throw error;

      if (!memberships || memberships.length === 0) return [];

      // 2. データを整形して返す
      return memberships.map((m: any) => {
        const diary = m.diary;
        return {
          ...diary,
          members: diary.members.map((mem: any) => mem.profile),
          is_pinned: m.is_pinned,
          unread_count: 0,
          latest_entry: undefined,
        };
      });
    } catch (error) {
      console.error('❌ 交換日記一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * 新しい交換日記を作成
   */
  static async createDiary(title: string, friendIds: string[], diaryType: DiaryType) {
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
          diary_type: diaryType,
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
      // 日記、メンバー、エントリーを一括取得
      const { data: diary, error: diaryError } = await supabase
        .from('diaries')
        .select(
          `
          *,
          members:diary_members(
            profile:profiles(*)
          ),
          entries:diary_entries(
            *,
            author:profiles(*)
          )
        `
        )
        .eq('id', diaryId)
        .order('posted_date', { foreignTable: 'entries', ascending: false })
        .single();

      if (diaryError) throw diaryError;

      // 整形して返す
      const formattedDiary = {
        ...diary,
        members: diary.members.map((m: any) => m.profile),
        entries: diary.entries || [],
      };

      return {
        success: true,
        data: formattedDiary,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ 交換日記詳細取得エラー:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * 交換日記のエントリー一覧を取得
   * 古い順（最新が下）に並べる
   */
  static async getDiaryEntries(diaryId: string) {
    try {
      const { data: entries, error } = await supabase
        .from('diary_entries')
        .select('*, author:profiles(*)')
        .eq('diary_id', diaryId)
        .order('created_at', { ascending: true }); // 古い順（最新が下）

      if (error) throw error;

      return { success: true, data: entries || [], error: null };
    } catch (error: any) {
      console.error('❌ エントリー一覧取得エラー:', error);
      return { success: false, data: [], error };
    }
  }

  /**
   * 今日投稿可能かチェック（1日1回制限）
   */
  static async canPostToday(diaryId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // 今日の0時を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // 今日の自分の投稿を取得
      const { data: entries, error } = await supabase
        .from('diary_entries')
        .select('id')
        .eq('diary_id', diaryId)
        .eq('author_id', user.id)
        .gte('created_at', todayISO);

      if (error) throw error;

      // 投稿がなければtrue
      return !entries || entries.length === 0;
    } catch (error) {
      console.error('❌ 投稿可能チェックエラー:', error);
      return false;
    }
  }

  /**
   * 次に投稿可能な時刻を取得
   */
  static async getNextPostTime(diaryId: string): Promise<Date | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      // 最新の投稿を取得
      const { data: lastEntry, error } = await supabase
        .from('diary_entries')
        .select('created_at')
        .eq('diary_id', diaryId)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !lastEntry) return null;

      // 最終投稿時刻 + 24時間
      const lastPostTime = new Date(lastEntry.created_at);
      const nextPostTime = new Date(lastPostTime);
      nextPostTime.setDate(nextPostTime.getDate() + 1);
      nextPostTime.setHours(0, 0, 0, 0); // 翌日の0時

      return nextPostTime;
    } catch (error) {
      console.error('❌ 次回投稿時刻取得エラー:', error);
      return null;
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

      // ユーザープロフィール取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      // 日記情報取得
      const { data: diary } = await supabase
        .from('diaries')
        .select('title')
        .eq('id', diaryId)
        .single();

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

      // 通知を送信（バックグラウンドで実行）
      if (profile && diary) {
        NotificationService.sendDiaryEntryNotification(
          diaryId,
          profile.display_name || 'メンバー',
          diary.title
        ).catch((err) => console.error('通知送信エラー:', err));
      }

      return { success: true, data, error: null };
    } catch (error: any) {
      console.error('❌ エントリー作成エラー:', error);
      return { success: false, data: null, error };
    }
  }

  /**
   * エントリーIDから著者情報を含むエントリーを取得
   */
  static async getEntryWithAuthor(entryId: string) {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*, author:profiles(*)')
        .eq('id', entryId)
        .single();

      if (error) throw error;

      return { success: true, data, error: null };
    } catch (error: any) {
      return { success: false, data: null, error };
    }
  }

  /**
   * Realtimeチャンネルを購読
   * @param diaryId 日記ID
   * @param callbacks イベントハンドラー
   * @returns チャンネルオブジェクト（クリーンアップ用）
   */
  static subscribeToEntries(
    diaryId: string,
    callbacks: {
      onInsert?: (entry: DiaryEntry & { author: Profile }) => void;
      onUpdate?: (entry: DiaryEntry & { author: Profile }) => void;
      onDelete?: (entryId: string) => void;
    }
  ) {
    const channel = supabase
      .channel(`diary_entries:${diaryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diary_entries',
          filter: `diary_id=eq.${diaryId}`,
        },
        async (payload) => {
          // INSERT
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            const result = await this.getEntryWithAuthor(payload.new.id);
            if (result.success && result.data) {
              callbacks.onInsert(result.data);
            }
          }

          // UPDATE
          if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            const result = await this.getEntryWithAuthor(payload.new.id);
            if (result.success && result.data) {
              callbacks.onUpdate(result.data);
            }
          }

          // DELETE
          if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete(payload.old.id);
          }
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Realtimeチャンネルの購読を解除
   */
  static unsubscribeFromEntries(channel: any) {
    supabase.removeChannel(channel);
  }

  /**
   * ピン留め状態を切り替え
   */
  static async togglePin(diaryId: string, userId: string, currentStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from('diary_members')
      .update({ is_pinned: !currentStatus })
      .eq('diary_id', diaryId)
      .eq('profile_id', userId);

    if (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  }
}
