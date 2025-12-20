import { supabase } from '@/lib/supabase';
import {
  Capsule,
  CapsuleContent,
  CapsuleContentWithAuthor,
  CapsuleStatus,
  CapsuleWithMembers,
  ContentType,
  CreateCapsuleData,
  MemberRole,
  MemberStatus,
  UpdateCapsuleContentData,
} from '@/types';

class CapsuleService {
  /**
   * ユーザーのタイムカプセル一覧を取得
   */
  async getUserCapsules(userId: string): Promise<CapsuleWithMembers[]> {
    // 1. 自分の参加情報(capsule_members)を起点に、カプセル情報(capsules)と関連データ(members, creator, contents)を一括取得
    const { data: memberships, error } = await supabase
      .from('capsule_members')
      .select(
        `
        is_pinned,
        capsule:capsules!inner(
          *,
          creator:profiles!created_by(*),
          members:capsule_members(
            *,
            profile:profiles(*)
          ),
          capsule_contents(id)
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('capsule.status', 'deleted')
      .order('created_at', { foreignTable: 'capsule', ascending: false });

    if (error) {
      console.error('Error fetching user capsules:', error);
      throw error;
    }

    if (!memberships || memberships.length === 0) {
      return [];
    }

    // 2. データを整形して返す
    return memberships.map((m: any) => {
      const capsule = m.capsule;

      return {
        ...capsule,
        // creatorは結合済み
        creator: Array.isArray(capsule.creator) ? capsule.creator[0] : capsule.creator,
        members: capsule.members.filter((mem: any) => mem.status === 'active'),
        contents_count: capsule.capsule_contents?.length || 0,
        is_pinned: m.is_pinned,
      };
    });
  }

  /**
   * ピン留め状態を切り替え
   */
  async togglePin(capsuleId: string, userId: string, currentStatus: boolean): Promise<void> {
    const { error } = await supabase
      .from('capsule_members')
      .update({ is_pinned: !currentStatus })
      .eq('capsule_id', capsuleId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  }

  /**
   * タイムカプセルを作成
   */
  async createCapsule(data: CreateCapsuleData, userId: string): Promise<Capsule> {
    // カプセルを作成
    const { data: capsule, error: capsuleError } = await supabase
      .from('capsules')
      .insert({
        title: data.title,
        description: data.description,
        created_by: userId,
        unlock_at: data.unlock_at,
        capsule_type: data.capsule_type,
        status: CapsuleStatus.Locked,
      })
      .select()
      .single();

    if (capsuleError) {
      console.error('Error creating capsule:', capsuleError);
      throw capsuleError;
    }

    // 作成者をオーナーとして追加
    const { error: ownerError } = await supabase.from('capsule_members').insert({
      capsule_id: capsule.id,
      user_id: userId,
      role: MemberRole.Owner,
      status: MemberStatus.Active,
    });

    if (ownerError) {
      console.error('Error adding owner to capsule:', ownerError);
      // カプセルを削除
      await supabase.from('capsules').delete().eq('id', capsule.id);
      throw ownerError;
    }

    // メンバーを追加（1対1またはグループの場合）
    if (data.member_ids && data.member_ids.length > 0) {
      const memberInserts = data.member_ids.map((memberId) => ({
        capsule_id: capsule.id,
        user_id: memberId,
        role: MemberRole.Member,
        status: MemberStatus.Active,
      }));

      const { error: membersError } = await supabase.from('capsule_members').insert(memberInserts);

      if (membersError) {
        console.error('Error adding members to capsule:', membersError);
        // エラーが発生してもカプセルは作成済みなので、エラーをログに記録するだけ
      }
    }

    return capsule;
  }

  /**
   * タイムカプセルの詳細を取得
   */
  async getCapsuleById(capsuleId: string): Promise<CapsuleWithMembers | null> {
    const { data, error } = await supabase
      .from('capsules')
      .select(
        `
        *,
        creator:profiles!created_by(*),
        members:capsule_members(
          id,
          user_id,
          role,
          status,
          joined_at,
          profile:profiles(
            id,
            user_id,
            display_name,
            avatar_url
          )
        ),
        capsule_contents(id)
      `
      )
      .eq('id', capsuleId)
      .single();

    if (error) {
      console.error('Error fetching capsule:', error);
      throw error;
    }

    return {
      ...data,
      creator: Array.isArray(data.creator) ? data.creator[0] : data.creator,
      contents_count: data.capsule_contents?.length || 0,
    };
  }

  /**
   * タイムカプセルのコンテンツを取得
   */
  async getCapsuleContents(capsuleId: string): Promise<CapsuleContent[]> {
    const { data, error } = await supabase
      .from('capsule_contents')
      .select('*')
      .eq('capsule_id', capsuleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching capsule contents:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * タイムカプセルの全コンテンツを作成者情報付きで取得
   */
  async getCapsuleContentsWithAuthors(capsuleId: string): Promise<CapsuleContentWithAuthor[]> {
    // N+1問題を解消: 一回のクエリで作成者情報も取得
    const { data, error } = await supabase
      .from('capsule_contents')
      .select('*, author:profiles(*)')
      .eq('capsule_id', capsuleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching capsule contents with authors:', error);
      throw error;
    }

    return (data || []).map((content: any) => ({
      ...content,
      author: Array.isArray(content.author) ? content.author[0] : content.author,
    }));
  }

  /**
   * タイムカプセルにコンテンツを追加
   */
  async addContent(
    capsuleId: string,
    userId: string,
    content: {
      content_type: 'text' | 'image' | 'video' | 'audio';
      text_content?: string;
      media_url?: string;
    }
  ): Promise<CapsuleContent> {
    const { data, error } = await supabase
      .from('capsule_contents')
      .insert({
        capsule_id: capsuleId,
        created_by: userId,
        content_type: content.content_type,
        text_content: content.text_content,
        media_url: content.media_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding content to capsule:', error);
      throw error;
    }

    return data;
  }

  /**
   * タイムカプセルが開封可能かチェック
   */
  async canUnlockCapsule(capsuleId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('capsules')
      .select('unlock_at, status')
      .eq('id', capsuleId)
      .single();

    if (error) {
      console.error('Error checking capsule unlock status:', error);
      return false;
    }

    const unlockDate = new Date(data.unlock_at);
    const now = new Date();

    return now >= unlockDate && data.status === 'locked';
  }

  /**
   * タイムカプセルを開封
   */
  async unlockCapsule(capsuleId: string): Promise<void> {
    const canUnlock = await this.canUnlockCapsule(capsuleId);

    if (!canUnlock) {
      throw new Error('CAPSULE_NOT_UNLOCKABLE');
    }

    const { error } = await supabase
      .from('capsules')
      .update({
        status: CapsuleStatus.Unlocked,
        unlocked_at: new Date().toISOString(),
      })
      .eq('id', capsuleId);

    if (error) {
      console.error('Error unlocking capsule:', error);
      throw error;
    }
  }

  /**
   * タイムカプセルのタイトルと説明を更新
   */
  async updateCapsuleInfo(
    capsuleId: string,
    data: { title?: string; description?: string }
  ): Promise<void> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    const { error } = await supabase.from('capsules').update(updateData).eq('id', capsuleId);

    if (error) {
      console.error('Error updating capsule info:', error);
      throw error;
    }
  }

  /**
   * タイムカプセルを削除
   */
  async deleteCapsule(capsuleId: string): Promise<void> {
    const { data, error } = await supabase
      .from('capsules')
      .update({ status: 'deleted' as CapsuleStatus })
      .eq('id', capsuleId)
      .select();

    if (error) {
      console.error('Error deleting capsule:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('No rows updated. Possible RLS policy issue or capsule not found.');
      throw new Error('CAPSULE_DELETE_FAILED');
    }

    console.log('Capsule deleted successfully:', data[0]);
  }

  /**
   * ユーザーの投稿したコンテンツを取得（1人1つまで）
   */
  async getUserContent(
    capsuleId: string,
    userId: string
  ): Promise<CapsuleContentWithAuthor | null> {
    const { data, error } = await supabase
      .from('capsule_contents')
      .select('*, author:profiles(*)')
      .eq('capsule_id', capsuleId)
      .eq('created_by', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user content:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      author: Array.isArray(data.author) ? data.author[0] : data.author,
    };
  }

  /**
   * コンテンツを作成または更新（1人1つ制約）
   */
  async createOrUpdateContent(
    capsuleId: string,
    userId: string,
    data: UpdateCapsuleContentData
  ): Promise<CapsuleContent> {
    // 既存のコンテンツを確認
    const existingContent = await this.getUserContent(capsuleId, userId);

    if (existingContent) {
      // 既に保存済みの場合は編集不可
      throw new Error('EDIT_LIMIT_REACHED');
    }

    // 新規作成（1度のみ保存可能）
    const { data: created, error } = await supabase
      .from('capsule_contents')
      .insert({
        capsule_id: capsuleId,
        created_by: userId,
        content_type: data.media_url ? ContentType.Image : ContentType.Text,
        text_content: data.text_content,
        media_url: data.media_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content:', error);
      throw error;
    }

    return created;
  }

  /**
   * 自分が投稿可能なカプセル（まだ投稿していない）を取得
   */
  async getPendingCapsules(userId: string): Promise<CapsuleWithMembers[]> {
    try {
      const { data, error } = await supabase
        .from('capsule_members')
        .select(
          `
          is_pinned,
          capsule:capsules!inner(
            *,
            creator:profiles!created_by(*),
            members:capsule_members(
              user_id,
              profile:profiles(*)
            ),
            capsule_contents(id, created_by)
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('capsule.status', 'locked') // 開封前のみ
        .order('created_at', { foreignTable: 'capsule', ascending: false });

      if (error) throw error;

      // 自分がまだ投稿していないカプセルをフィルタリング
      const pendingCapsules = data
        .map((m: any) => {
          const capsule = m.capsule;
          const userHasPosted = capsule.capsule_contents?.some(
            (content: any) => content.created_by === userId
          );

          if (userHasPosted) return null;

          return {
            ...capsule,
            is_pinned: m.is_pinned,
            members: capsule.members || [],
            creator: Array.isArray(capsule.creator) ? capsule.creator[0] : capsule.creator,
            contents_count: capsule.capsule_contents?.length || 0,
          };
        })
        .filter(Boolean) as CapsuleWithMembers[];

      return pendingCapsules;
    } catch (error) {
      console.error('Error fetching pending capsules:', error);
      throw error;
    }
  }

  /**
   * 開封可能なカプセルを取得
   */
  async getUnlockableCapsules(userId: string): Promise<CapsuleWithMembers[]> {
    try {
      const { data, error } = await supabase
        .from('capsule_members')
        .select(
          `
          is_pinned,
          capsule:capsules!inner(
            *,
            creator:profiles!created_by(*),
            members:capsule_members(
              user_id,
              profile:profiles(*)
            ),
            capsule_contents(id)
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('capsule.status', 'locked')
        .lte('capsule.unlock_at', new Date().toISOString())
        .order('unlock_at', { foreignTable: 'capsule', ascending: true });

      if (error) throw error;

      return (data || []).map((m: any) => {
        const capsule = m.capsule;
        return {
          ...capsule,
          is_pinned: m.is_pinned,
          members: capsule.members || [],
          creator: Array.isArray(capsule.creator) ? capsule.creator[0] : capsule.creator,
          contents_count: capsule.capsule_contents?.length || 0,
        };
      });
    } catch (error) {
      console.error('Error fetching unlockable capsules:', error);
      throw error;
    }
  }

  /**
   * 開封日までの残り時間を計算
   */
  getTimeUntilUnlock(unlockAt: string): {
    days: number;
    hours: number;
    minutes: number;
    isUnlockable: boolean;
  } {
    const unlockDate = new Date(unlockAt);
    const now = new Date();
    const diff = unlockDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isUnlockable: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isUnlockable: false };
  }
}

export const capsuleService = new CapsuleService();
