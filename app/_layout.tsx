import '@/assets/css/global.css';
import { Slot } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return <RootLayoutContent />;
}

function RootLayoutContent() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1" pointerEvents="auto">
        <Slot />
      </View>
    </SafeAreaView>
  );
}
