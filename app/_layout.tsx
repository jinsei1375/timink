import '@/assets/css/global.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthScreen from './auth';

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const { user, loading } = useAuth();

  // Deep linkの処理
  useEffect(() => {
    // 初回起動時のURL処理
    Linking.getInitialURL().then((url) => {
      if (url) {
        createSessionFromUrl(url);
      }
    });

    // Deep linkイベントの監視
    const subscription = Linking.addEventListener('url', ({ url }) => {
      createSessionFromUrl(url);
    });

    return () => subscription?.remove();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1" pointerEvents="auto">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaView>
  );
}
