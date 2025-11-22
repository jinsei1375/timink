import { useNavigation, useRouter } from 'expo-router';
import { useCallback } from 'react';

interface FallbackRoute {
  name: string;
  params?: Record<string, any>;
}

/**
 * 戻るボタンの挙動を制御するフック
 * 履歴がある場合は戻り、ない場合は指定されたフォールバックルートにリセットします
 *
 * @param fallbackRoute 履歴がない場合の遷移先ルート情報
 */
export const useHandleBack = (fallbackRoute: FallbackRoute) => {
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // 履歴がない場合は指定ページにリセット（アニメーションの向きを考慮してresetを使用）
      navigation.reset({
        index: 0,
        routes: [fallbackRoute as any],
      });
    }
  }, [navigation, router, fallbackRoute]);

  return handleBack;
};
