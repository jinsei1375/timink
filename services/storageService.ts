import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Supabase Storage操作のサービスクラス
 * 画像のアップロード、削除、URL取得などを管理
 */
export class StorageService {
  /**
   * 画像をSupabase Storageにアップロード
   * @param uri - ローカル画像のURI
   * @param bucket - バケット名
   * @param path - ストレージ内のパス
   * @returns アップロードされた画像の公開URL
   */
  static async uploadImage(uri: string, bucket: string, path: string): Promise<string> {
    try {
      // 画像をBase64に変換
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Base64をArrayBufferにデコード
      const arrayBuffer = decode(base64);

      // ファイル拡張子を取得
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

      // Storageにアップロード
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
        contentType,
        upsert: true,
      });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * ユーザーのアバター画像をアップロード
   * @param userId - ユーザーID
   * @param imageUri - ローカル画像のURI
   * @returns アップロードされたアバター画像の公開URL
   */
  static async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    return await this.uploadImage(imageUri, 'avatars', filePath);
  }

  /**
   * ユーザーのアバターURLを更新
   * @param userId - ユーザーID
   * @param avatarUrl - 新しいアバターURL
   */
  static async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * 古いアバター画像を削除
   * @param oldAvatarUrl - 削除する画像の公開URL
   */
  static async deleteOldAvatar(oldAvatarUrl: string | null): Promise<void> {
    if (!oldAvatarUrl) return;

    try {
      // URLからファイルパスを抽出
      const url = new URL(oldAvatarUrl);
      const pathParts = url.pathname.split('/');
      const bucket = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Storageから削除
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting old avatar:', error);
      // 削除エラーは無視（画像が存在しない場合など）
    }
  }

  /**
   * アバター画像を更新（古い画像の削除 + 新しい画像のアップロード + DB更新）
   * @param userId - ユーザーID
   * @param newImageUri - 新しい画像のURI
   * @param oldAvatarUrl - 古いアバターURL（削除用）
   * @returns 新しいアバターの公開URL
   */
  static async updateAvatar(
    userId: string,
    newImageUri: string,
    oldAvatarUrl: string | null
  ): Promise<string> {
    try {
      // 新しい画像をアップロード
      const newAvatarUrl = await this.uploadAvatar(userId, newImageUri);

      // DBを更新
      await this.updateUserAvatar(userId, newAvatarUrl);

      // 古い画像を削除（エラーでも続行）
      await this.deleteOldAvatar(oldAvatarUrl);

      return newAvatarUrl;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }
}
