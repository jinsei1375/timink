import { supabase } from '../lib/supabase';
import { Capsule, CapsuleContent, CapsuleWithMembers, CreateCapsuleData } from '../types';

class CapsuleService {
  /**
   * ユーザーのタイムカプセル一覧を取得
   */
  async getUserCapsules(userId: string): Promise<CapsuleWithMembers[]> {
    const { data, error } = await supabase
      .from('capsules')
      .select(
        `
        *,
        members:capsule_members!inner(
          id,
          user_id,
          role,
          status,
          joined_at
        )
      `
      )
      .eq('members.user_id', userId)
      .eq('members.status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user capsules:', error);
      throw error;
    }

    // creatorプロフィールとコンテンツ数を取得
    const capsulesWithCount = await Promise.all(
      (data || []).map(async (capsule) => {
        // creatorのプロフィールを取得
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, avatar_url')
          .eq('user_id', capsule.created_by)
          .single();

        // コンテンツ数を取得
        const { count } = await supabase
          .from('capsule_contents')
          .select('*', { count: 'exact', head: true })
          .eq('capsule_id', capsule.id);

        return {
          ...capsule,
          creator: creatorProfile || undefined,
          contents_count: count || 0,
        };
      })
    );

    return capsulesWithCount;
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
        status: 'locked',
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
      role: 'owner',
      status: 'active',
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
        role: 'member' as const,
        status: 'active' as const,
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
        )
      `
      )
      .eq('id', capsuleId)
      .single();

    if (error) {
      console.error('Error fetching capsule:', error);
      throw error;
    }

    // creatorのプロフィールを取得
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, avatar_url')
      .eq('user_id', data.created_by)
      .single();

    // コンテンツ数を取得
    const { count } = await supabase
      .from('capsule_contents')
      .select('*', { count: 'exact', head: true })
      .eq('capsule_id', capsuleId);

    return {
      ...data,
      creator: creatorProfile || undefined,
      contents_count: count || 0,
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
      throw new Error('このカプセルはまだ開封できません');
    }

    const { error } = await supabase
      .from('capsules')
      .update({
        status: 'unlocked',
        unlocked_at: new Date().toISOString(),
      })
      .eq('id', capsuleId);

    if (error) {
      console.error('Error unlocking capsule:', error);
      throw error;
    }
  }

  /**
   * タイムカプセルを削除
   */
  async deleteCapsule(capsuleId: string): Promise<void> {
    const { error } = await supabase
      .from('capsules')
      .update({ status: 'deleted' })
      .eq('id', capsuleId);

    if (error) {
      console.error('Error deleting capsule:', error);
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
