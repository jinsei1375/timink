import { FriendSelectItem } from '@/components/ui/FriendSelectItem';
import { Profile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface MemberListModalProps {
  visible: boolean;
  onClose: () => void;
  members: Profile[];
  title?: string;
}

export const MemberListModal = ({
  visible,
  onClose,
  members,
  title = 'メンバー一覧',
}: MemberListModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white w-full max-w-sm rounded-2xl overflow-hidden max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-800 text-center flex-1">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView className="p-4">
            {members.map((member) => (
              <FriendSelectItem
                key={member.id}
                friend={{
                  id: member.id,
                  profile: member,
                  friendship_id: '',
                  since: '',
                }}
                isSelected={false}
              />
            ))}
            {members.length === 0 && (
              <Text className="text-center text-gray-500 py-4">メンバーがいません</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
