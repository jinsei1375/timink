import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function useNotificationObserver() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (response && response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      const data = response.notification.request.content.data;

      if (data.type === 'diary_entry' && data.diaryId) {
        router.push(`/diary/${data.diaryId}` as any);
      }
    }
  }, [response]);
}
