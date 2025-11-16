import { MemberAvatarGroup } from '@/components/diary/MemberAvatarGroup';
import { InfoBox } from '@/components/ui/InfoBox';
import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { CapsuleContentWithAuthor, CapsuleStatus, CapsuleType, CapsuleWithMembers } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CapsuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [capsule, setCapsule] = useState<CapsuleWithMembers | null>(null);
  const [contents, setContents] = useState<CapsuleContentWithAuthor[]>([]);
  const [userContent, setUserContent] = useState<CapsuleContentWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id || !user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [capsuleData, contentsData, userContentData] = await Promise.all([
        capsuleService.getCapsuleById(id as string),
        capsuleService.getCapsuleContents(id as string),
        capsuleService.getUserContent(id as string, user.id),
      ]);

      setCapsule(capsuleData);
      setContents(contentsData);
      setUserContent(userContentData);
    } catch (error) {
      console.error('Failed to load capsule data:', error);
      Alert.alert('エラー', 'カプセル情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!capsule) return;

    try {
      setUnlocking(true);
      await capsuleService.unlockCapsule(capsule.id);
      Alert.alert('開封完了', 'タイムカプセルを開封しました！');
      loadData(); // 再読み込み
    } catch (error) {
      console.error('Error unlocking capsule:', error);
      Alert.alert('エラー', 'カプセルの開封に失敗しました');
    } finally {
      setUnlocking(false);
    }
  };

  const handleEditContent = () => {
    if (!capsule) return;
    router.push(`/capsule/${capsule.id}/edit` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6C6EE6" />
      </View>
    );
  }

  if (!capsule) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-center mt-4">カプセルが見つかりませんでした</Text>
      </View>
    );
  }

  const timeUntilUnlock = capsuleService.getTimeUntilUnlock(capsule.unlock_at);
  const isOwner = capsule.created_by === user?.id;
  const isUnlocked = capsule.status === CapsuleStatus.Unlocked;

  // ロックアイコンの色
  const lockColor = isUnlocked ? '#10B981' : '#6C6EE6';

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* ヘッダー */}
      <View className="bg-app-primary p-6 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* オーナーの場合は編集ボタンを表示 */}
          {isOwner && (
            <TouchableOpacity onPress={() => router.push(`/capsule/${id}/edit-info` as any)}>
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center mb-2">
          <Ionicons name={isUnlocked ? 'lock-open' : 'lock-closed'} size={32} color="white" />
          <Text className="text-white text-2xl font-bold ml-3">{capsule.title}</Text>
        </View>

        {capsule.description && (
          <Text className="text-white/80 text-base mt-2">{capsule.description}</Text>
        )}

        {/* タイムカプセルタイプ */}
        <View className="flex-row items-center mt-4">
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-sm">
              {capsule.capsule_type === CapsuleType.Personal
                ? '個人'
                : capsule.capsule_type === CapsuleType.OneToOne
                  ? '1対1'
                  : 'グループ'}
            </Text>
          </View>
        </View>
      </View>

      {/* コンテンツエリア */}
      <View className="p-6">
        {/* 開封状態 */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700 font-semibold text-base">開封状態</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                isUnlocked ? 'bg-green-100' : 'bg-app-primary/10'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isUnlocked ? 'text-green-700' : 'text-app-primary'
                }`}
              >
                {isUnlocked ? '開封済み' : 'ロック中'}
              </Text>
            </View>
          </View>

          {!isUnlocked && (
            <View>
              <Text className="text-gray-600 text-sm mb-2">開封まで</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-baseline">
                  {timeUntilUnlock.days > 0 && (
                    <>
                      <Text className="text-3xl font-bold text-app-primary">
                        {timeUntilUnlock.days}
                      </Text>
                      <Text className="text-gray-500 ml-1 mr-3">日</Text>
                    </>
                  )}
                  <Text className="text-2xl font-bold text-app-primary">
                    {timeUntilUnlock.hours}
                  </Text>
                  <Text className="text-gray-500 ml-1 mr-2">時間</Text>
                  <Text className="text-2xl font-bold text-app-primary">
                    {timeUntilUnlock.minutes}
                  </Text>
                  <Text className="text-gray-500 ml-1">分</Text>
                </View>
              </View>

              {timeUntilUnlock.isUnlockable && (
                <TouchableOpacity
                  onPress={handleUnlock}
                  disabled={unlocking}
                  className="bg-app-primary rounded-lg py-3 mt-4"
                >
                  {unlocking ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">カプセルを開封する</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {isUnlocked && capsule.unlocked_at && (
            <Text className="text-gray-600 text-sm">
              {new Date(capsule.unlocked_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              に開封されました
            </Text>
          )}
        </View>

        {/* メンバー */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold text-base mb-3">メンバー</Text>
          <MemberAvatarGroup
            members={capsule.members?.filter((m) => m.profile).map((m) => m.profile!) || []}
          />
        </View>

        {/* コンテンツ情報 */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-gray-700 font-semibold text-base mb-2">投稿済みコンテンツ</Text>
          <Text className="text-gray-600">
            {capsule.contents_count || 0} / {capsule.members?.length || 1} 件
          </Text>
        </View>

        {/* 開封後のコンテンツ一覧 */}
        {isUnlocked && contents.length > 0 && (
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold text-base mb-3">みんなの想い出</Text>
            {contents.map((content) => (
              <View
                key={content.id}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
              >
                {/* 投稿者情報 */}
                <View className="flex-row items-center mb-3">
                  <View className="w-10 h-10 rounded-full bg-app-primary items-center justify-center">
                    <Text className="text-white font-semibold">
                      {content.author?.display_name?.[0]?.toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-semibold">
                      {content.author?.display_name || '名前なし'}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(content.created_at).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                </View>

                {/* テキストコンテンツ */}
                {content.text_content && (
                  <Text className="text-gray-700 mb-3">{content.text_content}</Text>
                )}

                {/* 画像コンテンツ */}
                {content.media_url && (
                  <Image
                    source={{ uri: content.media_url }}
                    className="w-full h-64 rounded-lg"
                    resizeMode="cover"
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* 編集ボタン（開封前のみ、かつコンテンツがまだない場合のみ表示） */}
        {!isUnlocked && !userContent && (
          <TouchableOpacity
            onPress={handleEditContent}
            className="bg-app-primary rounded-xl py-4 flex-row items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">自分のコンテンツを作成</Text>
          </TouchableOpacity>
        )}

        {/* コンテンツ保存済みメッセージ */}
        {!isUnlocked && userContent && (
          <InfoBox
            type="info"
            title="コンテンツを保存済みです"
            message="開封日時になると、あなたのコンテンツを含めすべてのコンテンツが閲覧できます"
          />
        )}

        {/* 削除ボタン（オーナーのみ） */}
        {isOwner && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('カプセルを削除', 'このタイムカプセルを削除してもよろしいですか？', [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await capsuleService.deleteCapsule(capsule.id);
                      router.replace('/(tabs)/capsules' as any);
                      setTimeout(() => {
                        Alert.alert('削除完了', 'カプセルを削除しました');
                      }, 300);
                    } catch (error) {
                      Alert.alert('エラー', 'カプセルの削除に失敗しました');
                    }
                  },
                },
              ]);
            }}
            className="border border-red-500 rounded-xl py-4 mt-3"
          >
            <Text className="text-red-500 text-center font-semibold">カプセルを削除</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
