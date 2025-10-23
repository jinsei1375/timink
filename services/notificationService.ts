import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 通知の表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * プッシュ通知のパーミッションをリクエストして、Expo Push Tokenを取得
   */
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C6EE6',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('通知の許可が得られませんでした');
        return null;
      }

      // Expo Push Tokenを取得
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: '870b6d3d-c4e5-4978-9e13-0b082eabae7e',
        })
      ).data;

      console.log('Expo Push Token:', token);
    } else {
      console.log('物理デバイスでのみプッシュ通知が動作します');
    }

    return token;
  }

  /**
   * ユーザーのExpo Push TokenをSupabaseに保存
   */
  static async saveExpoPushToken(userId: string, expoPushToken: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ expo_push_token: expoPushToken })
        .eq('id', userId);

      if (error) {
        console.error('Expo Push Token保存エラー:', error);
        throw error;
      }
    } catch (error) {
      console.error('Expo Push Token保存エラー:', error);
      throw error;
    }
  }

  /**
   * ローカル通知を表示（テスト用）
   */
  static async scheduleLocalNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'diary_entry' },
      },
      trigger: null, // 即座に表示
    });
  }

  /**
   * 日記投稿通知を送信するためのデータを準備
   * 実際の送信はSupabase Edge Functionで行う
   */
  static async sendDiaryEntryNotification(
    diaryId: string,
    authorName: string,
    diaryTitle: string
  ): Promise<void> {
    try {
      // Supabase Edge Functionを呼び出して通知を送信
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          diaryId,
          authorName,
          diaryTitle,
          type: 'diary_entry',
        },
      });

      if (error) {
        console.error('通知送信エラー:', error);
        throw error;
      }

      console.log('通知送信成功:', data);
    } catch (error) {
      console.error('通知送信エラー:', error);
      // エラーが発生しても投稿処理は続行
    }
  }

  /**
   * 通知リスナーを設定
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * 通知タップリスナーを設定
   */
  static addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}
