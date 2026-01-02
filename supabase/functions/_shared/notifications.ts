// 通知メッセージ定義（i18nから抽出）
export const NOTIFICATION_MESSAGES = {
  ja: {
    diaryEntry: {
      title: '新しい投稿',
      body: '{{authorName}}さんが「{{diaryTitle}}」に投稿しました',
    },
    capsuleUnlocked: {
      title: 'カプセルが開封されました',
      body: '{{unlockerName}}さんが「{{capsuleTitle}}」を開封しました',
    },
  },
  en: {
    diaryEntry: {
      title: 'New Entry',
      body: '{{authorName}} posted to "{{diaryTitle}}"',
    },
    capsuleUnlocked: {
      title: 'Capsule Unlocked',
      body: '{{unlockerName}} unlocked "{{capsuleTitle}}"',
    },
  },
  // 今後追加予定: id, fr, zh, ko など
} as const;

// テンプレート文字列を置換するヘルパー関数
export function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || '');
}

// メッセージ取得ヘルパー関数
export function getNotificationMessage(
  type: 'diaryEntry' | 'capsuleUnlocked',
  lang: string,
  params: Record<string, string>
): { title: string; body: string } {
  const langMessages =
    NOTIFICATION_MESSAGES[lang as keyof typeof NOTIFICATION_MESSAGES] || NOTIFICATION_MESSAGES.en;
  const messages = langMessages[type];

  return {
    title: messages.title,
    body: interpolate(messages.body, params),
  };
}
