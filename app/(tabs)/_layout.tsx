import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

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
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('tabs.friends'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diaries"
        options={{
          title: t('tabs.diaries'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="capsules"
        options={{
          title: t('tabs.capsules'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hourglass.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
