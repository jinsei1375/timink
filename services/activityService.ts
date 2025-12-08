import { supabase } from '@/lib/supabase';
import { Activity, ActivitySection, ActivityType, FriendshipStatus } from '@/types';
import { capsuleService } from './capsuleService';
import { DiaryService } from './diaryService';

export class ActivityService {
  /**
   * ホーム画面用のアクティビティセクション一覧を取得
   */
  static async getHomeActivities(userId: string, profileId: string): Promise<ActivitySection[]> {
    const sections: ActivitySection[] = [];

    try {
      // 1. 開封可能なカプセル
      const unlockableCapsules = await this.getUnlockableCapsules(userId);
      if (unlockableCapsules.length > 0) {
        sections.push({
          title: '開封可能なタイムカプセル',
          activities: unlockableCapsules,
        });
      }

      // 2. 今日投稿可能な交換日記
      const availableDiaries = await this.getAvailableDiaries(profileId);
      if (availableDiaries.length > 0) {
        sections.push({
          title: '今日投稿できる交換日記',
          activities: availableDiaries,
        });
      }

      // 3. 投稿待ち（まだ投稿していないカプセル）
      const pendingCapsules = await this.getPendingCapsules(userId);
      if (pendingCapsules.length > 0) {
        sections.push({
          title: '投稿待ちのタイムカプセル',
          activities: pendingCapsules,
        });
      }

      // 4. 思い出を振り返る（1年前の今日）
      const memories = await this.getDiaryMemories(profileId);
      if (memories.length > 0) {
        sections.push({
          title: '思い出を振り返る',
          activities: memories,
        });
      }

      // 5. 友達申請
      const friendRequests = await this.getFriendRequests(profileId);
      if (friendRequests.length > 0) {
        sections.push({
          title: '友達申請',
          activities: friendRequests,
        });
      }

      return sections;
    } catch (error) {
      console.error('Error fetching home activities:', error);
      return [];
    }
  }

  /**
   * 開封可能なカプセル
   */
  private static async getUnlockableCapsules(userId: string): Promise<Activity[]> {
    try {
      const capsules = await capsuleService.getUnlockableCapsules(userId);

      return capsules.slice(0, 3).map((capsule) => ({
        id: `unlockable-${capsule.id}`,
        type: ActivityType.CapsuleUnlockable,
        title: `「${capsule.title}」が開封できます`,
        description: this.getUnlockDescription(capsule.unlock_at),
        timestamp: '今すぐ',
        badge: '開封する',
        badgeColor: 'bg-red-500',
        icon: 'lock-open',
        actionable: true,
        data: { capsuleId: capsule.id },
      }));
    } catch (error) {
      console.error('Error in getUnlockableCapsules:', error);
      return [];
    }
  }

  /**
   * 投稿可能なカプセル（まだ投稿していない）
   */
  private static async getPendingCapsules(userId: string): Promise<Activity[]> {
    try {
      const pendingCapsules = await capsuleService.getPendingCapsules(userId);

      return pendingCapsules.slice(0, 3).map((capsule) => ({
        id: `pending-${capsule.id}`,
        type: ActivityType.CapsulePending,
        title: `「${capsule.title}」にメッセージを追加`,
        description: `メンバー${capsule.members?.length || 0}人のうち${
          capsule.contents_count || 0
        }人が投稿済み`,
        timestamp: this.getUnlockCountdown(capsule.unlock_at),
        badge: '投稿する',
        badgeColor: 'bg-purple-500',
        icon: 'create',
        actionable: true,
        data: { capsuleId: capsule.id },
      }));
    } catch (error) {
      console.error('Error in getPendingCapsules:', error);
      return [];
    }
  }

  /**
   * 今日投稿可能な交換日記
   */
  private static async getAvailableDiaries(profileId: string): Promise<Activity[]> {
    try {
      const diaries = await DiaryService.getMyDiaries();
      const today = new Date().toISOString().split('T')[0];

      const availableDiaries = await Promise.all(
        diaries.map(async (diary) => {
          const { data: todayEntry } = await supabase
            .from('diary_entries')
            .select('id')
            .eq('diary_id', diary.id)
            .eq('author_id', profileId)
            .gte('posted_date', today)
            .single();

          return todayEntry ? null : diary;
        })
      );

      return availableDiaries
        .filter(Boolean)
        .slice(0, 3)
        .map((diary: any) => ({
          id: `diary-available-${diary.id}`,
          type: ActivityType.DiaryAvailable,
          title: `「${diary.title}」に投稿できます`,
          description: '投稿可能です',
          timestamp: '',
          badge: '書く',
          badgeColor: 'bg-indigo-500',
          icon: 'book',
          actionable: true,
          data: { diaryId: diary.id },
        }));
    } catch (error) {
      console.error('Error in getAvailableDiaries:', error);
      return [];
    }
  }

  /**
   * 過去の振り返り（1年前の今日）
   */
  private static async getDiaryMemories(profileId: string): Promise<Activity[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const targetDate = oneYearAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('diary_entries')
        .select(
          `
          id,
          content,
          posted_date,
          diary:diaries!inner(
            id,
            title
          )
        `
        )
        .eq('author_id', profileId)
        .eq('posted_date', targetDate)
        .limit(3);

      if (error || !data || data.length === 0) return [];

      return data.map((entry: any) => ({
        id: `memory-${entry.id}`,
        type: ActivityType.DiaryMemory,
        title: `1年前の今日`,
        description: `「${entry.diary.title}」: ${entry.content.substring(0, 50)}...`,
        timestamp: '1年前',
        badge: '振り返る',
        badgeColor: 'bg-blue-500',
        icon: 'time-outline',
        actionable: true,
        data: { diaryId: entry.diary.id },
      }));
    } catch (error) {
      console.error('Error in getDiaryMemories:', error);
      return [];
    }
  }

  /**
   * 友達申請
   */
  private static async getFriendRequests(profileId: string): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          id,
          created_at,
          requester:profiles!requester_id(
            display_name,
            avatar_url
          )
        `
        )
        .eq('addressee_id', profileId)
        .eq('status', FriendshipStatus.Pending)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error || !data) return [];

      return data.map((req: any) => ({
        id: `friend-request-${req.id}`,
        type: ActivityType.FriendRequest,
        title: `👥 ${req.requester.display_name || '名前なし'}さんから友達申請`,
        description: '承認待ち',
        timestamp: this.getRelativeTime(req.created_at),
        badge: '確認',
        badgeColor: 'bg-green-500',
        icon: 'people',
        actionable: true,
        data: { friendRequestId: req.id },
      }));
    } catch (error) {
      console.error('Error in getFriendRequests:', error);
      return [];
    }
  }

  // ヘルパー関数
  private static getUnlockDescription(unlockAt: string): string {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const daysAgo = Math.floor(-diff / (1000 * 60 * 60 * 24));

    if (daysAgo === 0) return '今日開封可能になりました';
    if (daysAgo === 1) return '昨日開封可能になりました';
    return `${daysAgo}日前に開封可能になりました`;
  }

  private static getUnlockCountdown(unlockAt: string): string {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return '今日開封';
    if (days === 1) return '明日開封';
    return `${days}日後に開封`;
  }

  private static getRelativeTime(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return new Date(timestamp).toLocaleDateString('ja-JP');
  }
}
