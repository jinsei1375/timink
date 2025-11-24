import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6C6EE6', // ブランドプライマリカラー
        tabBarInactiveTintColor: '#9CA3AF', // グレー
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#EAEAEA',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diaries"
        options={{
          title: '交換日記',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="capsules"
        options={{
          title: 'タイムカプセル',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hourglass.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-friend"
        options={{
          href: null, // タブバーに表示しない
        }}
      />
    </Tabs>
  );
}
