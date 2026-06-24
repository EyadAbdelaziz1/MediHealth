import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/contexts/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      await new Promise((r) => setTimeout(r, 1500));
      const onboarded = await AsyncStorage.getItem('onboarding_complete');

      if (!isAuthenticated) {
        router.replace(onboarded ? '/login' : '/onboarding');
        return;
      }

      router.replace('/(app)');
    })();
  }, [isAuthenticated, isLoading]);

  return <LoadingScreen />;
}
