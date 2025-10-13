import { supabase } from '@/lib/supabase';
import { Friend, FriendRequest, UserSearchResult } from '@/types';

export class FriendService {
  /**
   * ユーザーID検索
   */
  static async searchUserById(
    userId: string,
    currentUserId: string
  ): Promise<UserSearchResult | null> {
    try {
      // プロフィール検索
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) return null;

      // 自分自身は検索結果から除外
      if (profile.id === currentUserId) return null;

      // 既に友達かチェック
      const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${currentUserId},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUserId})`
        )
        .maybeSingle();

      return {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        is_friend: friendship?.status === 'accepted',
        friendship_status: friendship?.status || 'none',
      };
    } catch (error) {
      console.error('❌ ユーザー検索エラー:', error);
      return null;
    }
  }

  /**
   * 友達リクエスト送信
   */
  static async sendFriendRequest(addresseeId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');

      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending',
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 友達リクエストエラー:', error);
      return { success: false, error };
    }
  }

  /**
   * 友達リクエスト承認
   */
  static async acceptFriendRequest(friendshipId: string) {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 友達リクエスト承認エラー:', error);
      return { success: false, error };
    }
  }

  /**
   * 友達リクエスト拒否
   */
  static async rejectFriendRequest(friendshipId: string) {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ 友達リクエスト拒否エラー:', error);
      return { success: false, error };
    }
  }

  /**
   * 受信した友達リクエスト一覧取得
   */
  static async getPendingRequests(): Promise<FriendRequest[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          id,
          status,
          created_at,
          requester:profiles!requester_id(*)
        `
        )
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      return (
        data?.map((item: any) => ({
          id: item.id,
          requester: item.requester,
          status: item.status,
          created_at: item.created_at,
        })) || []
      );
    } catch (error) {
      console.error('❌ リクエスト取得エラー:', error);
      return [];
    }
  }

  /**
   * 友達一覧取得
   */
  static async getFriends(): Promise<Friend[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          id,
          created_at,
          requester_id,
          addressee_id,
          requester:profiles!requester_id(*),
          addressee:profiles!addressee_id(*)
        `
        )
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      return (
        data?.map((item: any) => {
          const iAmRequester = item.requester_id === user.id;
          const friendProfile = iAmRequester ? item.addressee : item.requester;

          return {
            id: friendProfile.id,
            profile: friendProfile,
            friendship_id: item.id,
            since: item.created_at,
          };
        }) || []
      );
    } catch (error) {
      console.error('❌ 友達一覧取得エラー:', error);
      return [];
    }
  }
}
