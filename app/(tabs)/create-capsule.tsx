import { useAuth } from '@/contexts/AuthContext';
import { capsuleService } from '@/services/capsuleService';
import { FriendService } from '@/services/friendService';
import { CapsuleType, Friend } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

type DatePreset = {
  label: string;
  months: number;
};

export default function CreateCapsuleScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capsuleType, setCapsuleType] = useState<CapsuleType>('personal');
  const [unlockDate, setUnlockDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const data = await FriendService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const datePresets: DatePreset[] = [
    { label: '1ヶ月後', months: 1 },
    { label: '3ヶ月後', months: 3 },
    { label: '6ヶ月後', months: 6 },
    { label: '1年後', months: 12 },
    { label: '2年後', months: 24 },
    { label: '5年後', months: 60 },
  ];

  const selectDatePreset = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setUnlockDate(date);
    setShowDatePicker(false);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return false;
    }

    if (unlockDate <= new Date()) {
      Alert.alert('エラー', '開封日は未来の日時を選択してください');
      return false;
    }

    if (capsuleType === 'one_to_one' && selectedFriends.length !== 1) {
      Alert.alert('エラー', '1対1のカプセルには1人の友達を選択してください');
      return false;
    }

    if (capsuleType === 'group' && selectedFriends.length === 0) {
      Alert.alert('エラー', 'グループカプセルには最低1人の友達を選択してください');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!user || !validateForm()) return;

    try {
      setLoading(true);

      const capsuleData = {
        title: title.trim(),
        description: description.trim() || undefined,
        unlock_at: unlockDate.toISOString(),
        capsule_type: capsuleType,
        member_ids: capsuleType !== 'personal' ? selectedFriends : undefined,
      };

      await capsuleService.createCapsule(capsuleData, user.id);

      Alert.alert('成功', 'タイムカプセルを作成しました', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating capsule:', error);
      Alert.alert('エラー', 'タイムカプセルの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* ヘッダー */}
      <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#374151" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-900">カプセル作成</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4">
          {/* タイトル */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              タイトル <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="タイムカプセルのタイトル"
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              maxLength={50}
            />
          </View>

          {/* 説明 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">説明（任意）</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="このカプセルについての説明"
              multiline
              numberOfLines={3}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900"
              style={{ height: 80, textAlignVertical: 'top' }}
              maxLength={200}
            />
          </View>

          {/* カプセルタイプ */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              カプセルタイプ <Text className="text-red-500">*</Text>
            </Text>
            <View className="gap-2">
              <Pressable
                onPress={() => setCapsuleType('personal')}
                className={`flex-row items-center p-4 rounded-xl border ${
                  capsuleType === 'personal'
                    ? 'bg-app-primary-light border-app-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Ionicons
                  name={capsuleType === 'personal' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={capsuleType === 'personal' ? '#6C6EE6' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">個人</Text>
                  <Text className="text-sm text-gray-600">自分だけのカプセル</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setCapsuleType('one_to_one')}
                className={`flex-row items-center p-4 rounded-xl border ${
                  capsuleType === 'one_to_one'
                    ? 'bg-app-primary-light border-app-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Ionicons
                  name={capsuleType === 'one_to_one' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={capsuleType === 'one_to_one' ? '#6C6EE6' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">1対1</Text>
                  <Text className="text-sm text-gray-600">友達1人と共有</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setCapsuleType('group')}
                className={`flex-row items-center p-4 rounded-xl border ${
                  capsuleType === 'group'
                    ? 'bg-app-primary-light border-app-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Ionicons
                  name={capsuleType === 'group' ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={capsuleType === 'group' ? '#6C6EE6' : '#9CA3AF'}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900">グループ</Text>
                  <Text className="text-sm text-gray-600">複数の友達と共有</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* 友達選択 */}
          {capsuleType !== 'personal' && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                友達を選択 <Text className="text-red-500">*</Text>
              </Text>
              {friends.length === 0 ? (
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <Text className="text-sm text-yellow-800">
                    友達がいません。先に友達を追加してください。
                  </Text>
                </View>
              ) : (
                <View className="bg-white border border-gray-300 rounded-xl overflow-hidden">
                  {friends.map((friend) => (
                    <Pressable
                      key={friend.id}
                      onPress={() => toggleFriendSelection(friend.profile.id)}
                      className="flex-row items-center p-4 border-b border-gray-100"
                    >
                      <View className="bg-app-primary-light w-10 h-10 rounded-full items-center justify-center mr-3">
                        <Text className="text-app-primary font-semibold">
                          {friend.profile.display_name?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <Text className="flex-1 text-base text-gray-900">
                        {friend.profile.display_name || '名前なし'}
                      </Text>
                      <Ionicons
                        name={
                          selectedFriends.includes(friend.profile.id)
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={24}
                        color={selectedFriends.includes(friend.profile.id) ? '#6C6EE6' : '#9CA3AF'}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 開封日 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              開封日 <Text className="text-red-500">*</Text>
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-base text-gray-900">
                {unlockDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 日付選択モーダル */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowDatePicker(false)}
        >
          <View className="bg-white rounded-2xl p-6 m-4 w-80">
            <Text className="text-xl font-bold text-gray-900 mb-4">開封日を選択</Text>
            <View className="gap-2">
              {datePresets.map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => selectDatePreset(preset.months)}
                  className="bg-gray-50 p-4 rounded-xl active:bg-gray-100"
                >
                  <Text className="text-base font-medium text-gray-900">{preset.label}</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {(() => {
                      const date = new Date();
                      date.setMonth(date.getMonth() + preset.months);
                      return date.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    })()}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => setShowDatePicker(false)}
              className="mt-4 p-3 rounded-xl bg-gray-100"
            >
              <Text className="text-center text-base font-medium text-gray-700">キャンセル</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 作成ボタン */}
      <View className="bg-white border-t border-gray-200 p-4">
        <Pressable
          onPress={handleCreate}
          disabled={loading}
          className={`rounded-xl py-4 items-center ${loading ? 'bg-gray-400' : 'bg-app-primary'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">カプセルを作成</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
