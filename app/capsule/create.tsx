import { CalendarPickerModal } from '@/components/capsule/CalendarPickerModal';
import { CreateConfirmModal } from '@/components/capsule/CreateConfirmModal';
import { DatePickerModal } from '@/components/capsule/DatePickerModal';
import { DateSelector } from '@/components/capsule/DateSelector';
import { FormInput } from '@/components/capsule/FormInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { FriendSelectItem } from '@/components/ui/FriendSelectItem';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { TypeSelector } from '@/components/ui/TypeSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useRefresh } from '@/contexts/RefreshContext';
import { capsuleService } from '@/services/capsuleService';
import { FriendService } from '@/services/friendService';
import { CapsuleType, Friend, RefreshEvent } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  const { emit } = useRefresh();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capsuleType, setCapsuleType] = useState<CapsuleType>(CapsuleType.Personal);
  const [unlockDate, setUnlockDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleBack = () => {
    router.replace('/(tabs)/capsules');
  };

  // 画面から離れるときにフォームをリセット
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTitle('');
        setDescription('');
        setCapsuleType(CapsuleType.Personal);
        setUnlockDate(new Date());
        setSelectedFriends([]);
      };
    }, [])
  );

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

    if (capsuleType === CapsuleType.WithFriends && selectedFriends.length === 0) {
      Alert.alert('エラー', '友達を選択してください');
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
        member_ids: capsuleType === CapsuleType.WithFriends ? selectedFriends : undefined,
      };

      const createdCapsule = await capsuleService.createCapsule(capsuleData, user.id);

      emit(RefreshEvent.CAPSULE_CREATED);

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
      <ScreenHeader title="カプセル作成" onBack={handleBack} />

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
          <TypeSelector
            label="カプセルタイプ"
            options={[
              {
                value: CapsuleType.Personal,
                icon: 'person-outline',
                title: '個人',
                description: '自分だけのカプセル',
              },
              {
                value: CapsuleType.WithFriends,
                icon: 'people-outline',
                title: '友達と',
                description: '友達と共有',
              },
            ]}
            selectedType={capsuleType}
            onSelect={(type) => {
              setCapsuleType(type);
              if (type === CapsuleType.Personal) {
                setSelectedFriends([]);
              }
            }}
          />

          {/* 友達選択 */}
          {capsuleType === CapsuleType.WithFriends && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                友達を選択 ({selectedFriends.length}人選択中){' '}
                <Text className="text-red-500">*</Text>
              </Text>
              {friends.length === 0 ? (
                <EmptyState
                  icon="person.2"
                  title="友達がいません"
                  description="まず友達を追加してください"
                  actionLabel="友達を追加"
                  onAction={() => router.push('/friend/add')}
                />
              ) : (
                <View>
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.profile.id);
                    return (
                      <FriendSelectItem
                        key={friend.profile.id}
                        friend={friend}
                        isSelected={isSelected}
                        onToggle={toggleFriendSelection}
                      />
                    );
                  })}
                </View>
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
