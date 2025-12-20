import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle, error } = useAuth();

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.validationError'));
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        Alert.alert(t('common.error'), t('auth.passwordMismatch'));
        return;
      }
      if (!displayName.trim()) {
        Alert.alert(t('common.error'), t('auth.displayNameRequired'));
        return;
      }
    }

    try {
      setIsLoading(true);

      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        Alert.alert(t('auth.signUpSuccess'), t('auth.signUpMessage'));
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('auth.errorOccurred')
      );
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
        t('common.error'),
        error instanceof Error ? error.message : t('auth.errorOccurred')
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
              {isSignUp ? t('auth.signUp') : t('home.welcome')}
            </Text>
          </View>

          <View className="mb-8">
            {isSignUp && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {t('auth.displayName')}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t('auth.displayName')}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">{t('auth.email')}</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">{t('auth.password')}</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.password')}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {isSignUp && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {t('auth.confirmPassword')}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t('auth.confirmPassword')}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            )}

            {error && <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>}

            <TouchableOpacity
              className="bg-app-primary px-4 py-3 rounded-lg items-center mb-4"
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-sm text-gray-500">{t('common.or')}</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity
              className="bg-white border border-gray-300 px-4 py-3 rounded-lg items-center mb-4"
              onPress={handleGoogleAuth}
              disabled={isLoading}
            >
              <View className="flex-row items-center justify-center">
                <IconSymbol name="google" size={20} color="#4285f4" />
                <Text className="text-gray-700 text-base font-medium ml-2">
                  {t('auth.signIn')} (Google)
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
              <Text className="text-app-primary text-sm underline">
                {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
