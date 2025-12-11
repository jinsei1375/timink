import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationRequest {
  diaryId: string;
  authorId: string;
  authorName: string;
  diaryTitle: string;
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

    const { diaryId, authorId, authorName, diaryTitle, type }: NotificationRequest =
      await req.json();

    if (!diaryId || !authorId) {
      throw new Error(`Missing required fields: diaryId=${diaryId}, authorId=${authorId}`);
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

    // 日記のメンバーを取得（投稿者以外）
    const { data: members, error: membersError } = await supabase
      .from('diary_members')
      .select('profile_id, profiles!inner(expo_push_token)')
      .eq('diary_id', diaryId)
      .neq('profile_id', authorId);

    console.log('通知対象メンバー:', members);

    if (membersError) throw membersError;

    // Expo Push Tokenを収集
    const expoPushTokens =
      members
        ?.map((m: any) => m.profiles?.expo_push_token)
        .filter((token: string | null) => token !== null) || [];

    if (expoPushTokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: '通知対象のトークンがありません' }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Expo Push通知を送信
    const messages = expoPushTokens.map((pushToken: string) => ({
      to: pushToken,
      sound: 'default',
      title: '📖 新しい投稿',
      body: `${authorName}さんが「${diaryTitle}」に投稿しました`,
      data: {
        type,
        diaryId,
      },
      priority: 'high',
      channelId: 'default',
    }));

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
