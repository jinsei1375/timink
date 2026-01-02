import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getNotificationMessage } from '../_shared/notifications.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationRequest {
  diaryId?: string;
  authorId?: string;
  authorName?: string;
  diaryTitle?: string;
  capsuleId?: string;
  unlockerId?: string;
  unlockerName?: string;
  capsuleTitle?: string;
  type: string;
}

Deno.serve(async (req) => {
  try {
    // CORS対応
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const {
      diaryId,
      authorId,
      authorName,
      diaryTitle,
      capsuleId,
      unlockerId,
      unlockerName,
      capsuleTitle,
      type,
    }: NotificationRequest = await req.json();

    if (type === 'diary_entry' && (!diaryId || !authorId)) {
      throw new Error(
        `Missing required fields for diary_entry: diaryId=${diaryId}, authorId=${authorId}`
      );
    }

    if (type === 'capsule_unlocked' && (!capsuleId || !unlockerId)) {
      throw new Error(
        `Missing required fields for capsule_unlocked: capsuleId=${capsuleId}, unlockerId=${unlockerId}`
      );
    }

    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 認証されたユーザーを取得
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('認証が必要です');
    }

    // メンバーを取得（投稿者/開封者以外）
    let members;
    let membersError;

    if (type === 'diary_entry') {
      const result = await supabase
        .from('diary_members')
        .select('profile_id, profiles!inner(expo_push_token, preferred_language)')
        .eq('diary_id', diaryId!)
        .neq('profile_id', authorId!);
      members = result.data;
      membersError = result.error;
    } else if (type === 'capsule_unlocked') {
      const result = await supabase
        .from('capsule_members')
        .select('user_id, profiles!inner(expo_push_token, preferred_language)')
        .eq('capsule_id', capsuleId!)
        .eq('status', 'active')
        .neq('user_id', unlockerId!);
      members = result.data;
      membersError = result.error;
    }

    console.log('通知対象メンバー:', members);

    if (membersError) throw membersError;

    // メンバーごとの言語設定に応じた通知メッセージを生成
    const messages =
      members
        ?.filter((m: any) => m.profiles?.expo_push_token)
        .map((member: any) => {
          const pushToken = member.profiles.expo_push_token;
          const lang = member.profiles.preferred_language || 'en';

          let notificationMessage: { title: string; body: string };
          let data: any;

          if (type === 'diary_entry') {
            notificationMessage = getNotificationMessage('diaryEntry', lang, {
              authorName: authorName!,
              diaryTitle: diaryTitle!,
            });
            data = { type, diaryId };
          } else if (type === 'capsule_unlocked') {
            notificationMessage = getNotificationMessage('capsuleUnlocked', lang, {
              unlockerName: unlockerName!,
              capsuleTitle: capsuleTitle!,
            });
            data = { type, capsuleId };
          } else {
            throw new Error(`Unknown notification type: ${type}`);
          }

          return {
            to: pushToken,
            sound: 'default',
            title: notificationMessage.title,
            body: notificationMessage.body,
            data,
            priority: 'high',
            channelId: 'default',
          };
        }) || [];

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: '通知対象のトークンがありません' }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Expo Push通知結果:', result);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('通知送信エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
