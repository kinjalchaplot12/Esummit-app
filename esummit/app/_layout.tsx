/**
 * Root layout — initialises fonts, query client, splash screen,
 * and restores the auth session before any screen renders.
 *
 * Flow:
 * 1. Load fonts (Space Grotesk + Inter via @expo-google-fonts)
 * 2. Restore the session via authService (fake or real — see src/features/auth)
 * 3. Fetch AppConfig (with offline fallback)
 * 4. Check forced-update / maintenance
 * 5. First launch → /intro; then hide splash
 */

import React, { useEffect, useCallback } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useAuthStore } from '../src/store/authStore';
import { useConfigStore } from '../src/store/configStore';
import { api } from '../src/api/client';
import { authService } from '../src/features/auth/authService';
import { hasSeenIntro } from '../src/lib/introFlag';
import { colors } from '../src/theme';

// Prevent the splash from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:            2,
      staleTime:        1000 * 60 * 5,  // 5 minutes
      gcTime:           1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutInner(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const [booted, setBooted] = React.useState(false);
  const [introSeen, setIntroSeen] = React.useState(true);
  const segments = useSegments();
  const { setUser, setLoading } = useAuthStore();
  const { setConfig, loadCached } = useConfigStore();

  const bootstrap = useCallback(async () => {
    // 1. Load cached config so forced-update check works offline
    await loadCached();

    // 2. First-launch check + session restore
    const [seen, user] = await Promise.all([
      hasSeenIntro(),
      authService.restoreSession().catch(() => null), // expired / offline → logged out
    ]);
    setIntroSeen(seen);
    if (user) setUser(user);
    setLoading(false);

    // 3. Fetch fresh config (non-blocking for auth)
    try {
      const config = await api.getConfig();
      await setConfig(config);
    } catch {
      // Offline — continue with cached config
    }
  }, [setUser, setLoading, setConfig, loadCached]);

  useEffect(() => {
    bootstrap().then(() => setBooted(true));
  }, [bootstrap]);

  const ready = booted && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (!ready) return;
    // Route before revealing the app so first-time users never see the tabs flash.
    if (!introSeen && segments[0] !== '(onboarding)') {
      router.replace('/intro');
      setIntroSeen(true); // only redirect once per launch
    }
    SplashScreen.hideAsync().catch(() => undefined);
  }, [ready, introSeen, segments]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)"         options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)"   options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(auth)"         options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]"     options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="speakers"       options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="scanner"        options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="startup"        options={{ headerShown: false }} />
        <Stack.Screen name="+not-found"     options={{ title: 'Not Found' }} />
      </Stack>
    </>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutInner />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
