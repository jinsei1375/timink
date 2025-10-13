/**
 * ユニークなユーザーIDを生成
 * 形式: timink_xxxxxxxx (8文字のランダム英数字)
 */
export function generateUserId(): string {
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `timink_${randomStr}`;
}

/**
 * 表示名ベースのユーザーIDを生成
 * 形式: [sanitized_name]_xxxx (4文字のランダム英数字)
 */
export function generateUserIdFromName(displayName: string): string {
  const baseId = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 12);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return baseId ? `${baseId}_${randomSuffix}` : generateUserId();
}
