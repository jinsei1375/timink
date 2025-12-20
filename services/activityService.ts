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
          titleKey: 'activity.unlockableCapsule',
          activities: unlockableCapsules,
        });
      }

      // 2. 今日投稿可能な交換日記
      const availableDiaries = await this.getAvailableDiaries(profileId);
      if (availableDiaries.length > 0) {
        sections.push({
          titleKey: 'activity.postableDiary',
          activities: availableDiaries,
        });
      }

      // 3. 投稿待ち（まだ投稿していないカプセル）
      const pendingCapsules = await this.getPendingCapsules(userId);
      if (pendingCapsules.length > 0) {
        sections.push({
          titleKey: 'activity.pendingCapsule',
          activities: pendingCapsules,
        });
      }

      // 4. 思い出を振り返る（1年前の今日）
      const memories = await this.getDiaryMemories(profileId);
      if (memories.length > 0) {
        sections.push({
          titleKey: 'activity.memories',
          activities: memories,
        });
      }

      // 5. 友達申請
      const friendRequests = await this.getFriendRequests(profileId);
      if (friendRequests.length > 0) {
        sections.push({
          titleKey: 'activity.friendRequests',
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

      return capsules.slice(0, 3).map((capsule) => {
        const unlockParams = this.getUnlockDescriptionParams(capsule.unlock_at);
        return {
          id: `unlockable-${capsule.id}`,
          type: ActivityType.CapsuleUnlockable,
          titleKey: 'activity.capsuleUnlockableTitle',
          descriptionKey: this.getUnlockDescriptionKey(capsule.unlock_at),
          params: { title: capsule.title, ...unlockParams },
          timestampKey: 'activity.now',
          badgeKey: 'activity.unlock',
          badgeColor: 'bg-red-500',
          icon: 'lock-open',
          actionable: true,
          data: { capsuleId: capsule.id },
        };
      });
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

      return pendingCapsules.slice(0, 3).map((capsule) => {
        const countdownParams = this.getUnlockCountdownParams(capsule.unlock_at);
        return {
          id: `pending-${capsule.id}`,
          type: ActivityType.CapsulePending,
          titleKey: 'activity.capsulePendingTitle',
          descriptionKey: 'activity.capsulePendingDescription',
          params: {
            title: capsule.title,
            totalMembers: capsule.members?.length || 0,
            postedCount: capsule.contents_count || 0,
            ...countdownParams,
          },
          timestampKey: this.getUnlockCountdownKey(capsule.unlock_at),
          timestampParams: countdownParams,
          badgeKey: 'activity.post',
          badgeColor: 'bg-purple-500',
          icon: 'create',
          actionable: true,
          data: { capsuleId: capsule.id },
        };
      });
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
          titleKey: 'activity.diaryAvailableTitle',
          descriptionKey: 'activity.diaryAvailableDescription',
          params: { title: diary.title },
          timestamp: '',
          badgeKey: 'activity.write',
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
        titleKey: 'activity.memoryTitle',
        descriptionKey: 'activity.memoryDescription',
        params: {
          diaryTitle: entry.diary.title,
          content: entry.content.substring(0, 50),
        },
        timestampKey: 'activity.oneYearAgo',
        badgeKey: 'activity.reflect',
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

      return data.map((req: any) => {
        const timeParams = this.getRelativeTimeParams(req.created_at);
        return {
          id: `friend-request-${req.id}`,
          type: ActivityType.FriendRequest,
          titleKey: 'activity.friendRequestTitle',
          descriptionKey: 'activity.friendRequestDescription',
          params: { name: req.requester.display_name || 'Unknown', ...timeParams },
          timestampKey: this.getRelativeTimeKey(req.created_at),
          timestampParams: timeParams,
          badgeKey: 'activity.confirm',
          badgeColor: 'bg-green-500',
          icon: 'people',
          actionable: true,
          data: { friendRequestId: req.id },
        };
      });
    } catch (error) {
      console.error('Error in getFriendRequests:', error);
      return [];
    }
  }

  // ヘルパー関数
  private static getUnlockDescriptionKey(unlockAt: string): string {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const daysAgo = Math.floor(-diff / (1000 * 60 * 60 * 24));

    if (daysAgo === 0) return 'activity.unlockedToday';
    if (daysAgo === 1) return 'activity.unlockedYesterday';
    return 'activity.unlockedDaysAgo';
  }

  private static getUnlockDescriptionParams(unlockAt: string): Record<string, any> {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const daysAgo = Math.floor(-diff / (1000 * 60 * 60 * 24));
    return { days: daysAgo };
  }

  private static getUnlockCountdownKey(unlockAt: string): string {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return 'activity.unlockToday';
    if (days === 1) return 'activity.unlockTomorrow';
    return 'activity.unlockInDays';
  }

  private static getUnlockCountdownParams(unlockAt: string): Record<string, any> {
    const diff = new Date(unlockAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { days };
  }

  private static getRelativeTimeKey(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'activity.justNow';
    if (minutes < 60) return 'activity.minutesAgo';
    if (hours < 24) return 'activity.hoursAgo';
    if (days < 7) return 'activity.daysAgo';
    return 'activity.fullDate';
  }

  private static getRelativeTimeParams(timestamp: string): Record<string, any> {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return {
      minutes,
      hours,
      days,
      date: new Date(timestamp).toLocaleDateString(),
    };
  }
}
