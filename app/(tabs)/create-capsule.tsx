import { CalendarPickerModal } from '@/components/capsule/CalendarPickerModal';
import { CapsuleTypeSelector } from '@/components/capsule/CapsuleTypeSelector';
import { CreateConfirmModal } from '@/components/capsule/CreateConfirmModal';
import { DatePickerModal } from '@/components/capsule/DatePickerModal';
import { DateSelector } from '@/components/capsule/DateSelector';
import { FormInput } from '@/components/capsule/FormInput';
import { FriendSelector } from '@/components/capsule/FriendSelector';
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
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

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
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
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

  const handleSelectDatePreset = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setUnlockDate(date);
    setShowDatePicker(false);
  };

  const handleOpenCalendar = () => {
    setShowDatePicker(false);
    setTempDate(unlockDate);
    if (Platform.OS === 'ios') {
      setTimeout(() => setShowCalendarPicker(true), 100);
    } else {
      setShowCalendarPicker(true);
    }
  };

  const handleConfirmCalendar = () => {
    setUnlockDate(tempDate);
    setShowCalendarPicker(false);
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

  const handleCreateClick = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleCreate = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);

      const capsuleData = {
        title: title.trim(),
        description: description.trim() || undefined,
        unlock_at: unlockDate.toISOString(),
        capsule_type: capsuleType,
        member_ids: capsuleType !== 'personal' ? selectedFriends : undefined,
      };

      const createdCapsule = await capsuleService.createCapsule(capsuleData, user.id);

      // 作成したカプセルの詳細画面に遷移
      router.replace(`/capsule/${createdCapsule.id}` as any);
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
          <FormInput
            value={title}
            onChangeText={setTitle}
            label="タイトル"
            placeholder="タイムカプセルのタイトル"
            required
            maxLength={50}
          />

          {/* 説明 */}
          <FormInput
            value={description}
            onChangeText={setDescription}
            label="説明（任意）"
            placeholder="このカプセルについての説明"
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* カプセルタイプ */}
          <CapsuleTypeSelector selectedType={capsuleType} onSelect={setCapsuleType} />

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
                <FriendSelector
                  friends={friends}
                  selectedFriendIds={selectedFriends}
                  onToggleFriend={toggleFriendSelection}
                  maxSelection={capsuleType === 'one_to_one' ? 1 : undefined}
                />
              )}
            </View>
          )}

          {/* 開封日 */}
          <DateSelector unlockDate={unlockDate} onPress={() => setShowDatePicker(true)} />
        </View>
      </ScrollView>

      {/* 日付選択モーダル */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectPreset={handleSelectDatePreset}
        onOpenCalendar={handleOpenCalendar}
      />

      {/* カレンダーピッカーモーダル */}
      <CalendarPickerModal
        visible={showCalendarPicker}
        value={tempDate}
        onChange={setTempDate}
        onConfirm={handleConfirmCalendar}
        onCancel={() => setShowCalendarPicker(false)}
      />

      {/* 作成確認モーダル */}
      <CreateConfirmModal
        visible={showConfirmModal}
        title={title}
        capsuleType={capsuleType}
        unlockDate={unlockDate}
        friendCount={selectedFriends.length}
        onConfirm={handleCreate}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* 作成ボタン */}
      <View className="bg-white border-t border-gray-200 p-4">
        <Pressable
          onPress={handleCreateClick}
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
