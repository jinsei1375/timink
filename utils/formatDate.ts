/**
 * 日付を相対的な時間表記にフォーマットする
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた日付文字列
 * @example
 * formatDate('2024-01-15T10:30:00Z') // '2時間前'
 * formatDate('2024-01-10T10:30:00Z') // '5日前'
 * formatDate('2024-01-01T10:30:00Z') // '1月1日'
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString('ja-JP');
}

/**
 * 日付を絶対的な表記にフォーマットする
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた日付文字列
 * @example
 * formatAbsoluteDate('2024-01-15T10:30:00Z') // '2024年1月15日'
 */
export function formatAbsoluteDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP');
}

/**
 * 日付と時刻を含めてフォーマットする
 * @param dateString - ISO形式の日付文字列
 * @returns フォーマットされた日付時刻文字列
 * @example
 * formatDateTime('2024-01-15T10:30:00Z') // '2024年1月15日 10:30'
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
