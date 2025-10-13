import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, error } = useAuth();

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert('エラー', 'パスワードが一致しません');
        return;
      }
      if (!displayName.trim()) {
        Alert.alert('エラー', '表示名を入力してください');
        return;
      }
    }

    try {
      setIsLoading(true);

      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        Alert.alert(
          '成功',
          'アカウントが作成されました。確認メールを送信しました。\n\nシミュレーターではメールリンクが正常に動作しない場合があります。実機でテストするか、ログイン画面からログインしてください。'
        );
      }
    } catch (error) {
      Alert.alert('エラー', error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        'エラー',
        error instanceof Error ? error.message : 'Googleサインインに失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
  };

  const isSignUp = mode === 'signup';

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center p-6">
          <View className="items-center mb-12">
            <Image
              source={require('@/assets/images/icon.png')}
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-3xl font-bold text-gray-900 mb-2">Timink</Text>
            <Text className="text-base text-gray-500">
              {isSignUp ? 'アカウントを作成' : 'ようこそ'}
            </Text>
          </View>

          <View className="mb-8">
            {isSignUp && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">表示名</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="表示名を入力"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">メールアドレス</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                value={email}
                onChangeText={setEmail}
                placeholder="メールアドレスを入力"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">パスワード</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                value={password}
                onChangeText={setPassword}
                placeholder="パスワードを入力"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {isSignUp && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">パスワード確認</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="パスワードを再入力"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            )}

            {error && <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>}

            <TouchableOpacity
              className="bg-blue-500 px-4 py-3 rounded-lg items-center mb-4"
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {isSignUp ? 'アカウント作成' : 'ログイン'}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-sm text-gray-500">または</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity
              className="bg-white border border-gray-300 px-4 py-3 rounded-lg items-center mb-4"
              onPress={handleGoogleAuth}
              disabled={isLoading}
            >
              <View className="flex-row items-center justify-center">
                <IconSymbol name="google" size={20} color="#4285f4" />
                <Text className="text-gray-700 text-base font-medium ml-2">Googleでログイン</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
              <Text className="text-blue-500 text-sm underline">
                {isSignUp
                  ? 'すでにアカウントをお持ちですか？ ログイン'
                  : 'アカウントをお持ちでない方はこちら'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
