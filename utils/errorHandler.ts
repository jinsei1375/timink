import i18n from '@/i18n';

/**
 * エラーメッセージを翻訳する
 * サービス層から投げられたエラーコードを翻訳キーに変換
 */
export function getErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // エラーコードマッピング
  const errorKeyMap: Record<string, string> = {
    AUTH_REQUIRED: 'errors.authRequired',
    CAPSULE_NOT_UNLOCKABLE: 'errors.capsuleNotUnlockable',
    CAPSULE_DELETE_FAILED: 'errors.capsuleDeleteFailed',
  };

  // エラーコードが存在する場合は翻訳
  if (errorKeyMap[errorMessage]) {
    return i18n.t(errorKeyMap[errorMessage]);
  }

  // 存在しない場合はそのまま返す
  return errorMessage;
}
