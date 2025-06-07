import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';

function RootLayoutContent() {
  const { hasCompletedSetup, isLoading } = useAppContext();

  useEffect(() => {
    const initializeNavigation = async () => {
      try {
        if (!isLoading) {
          if (!hasCompletedSetup) {
            await router.replace('/setup');
          } else {
            await router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    initializeNavigation();
  }, [hasCompletedSetup, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AppProvider>
        <RootLayoutContent />
        <StatusBar style="auto" />
      </AppProvider>
    </ThemeProvider>
  );
}