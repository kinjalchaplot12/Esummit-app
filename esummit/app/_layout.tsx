/**
 * Root layout — initialises fonts, query client, splash screen,
 * and restores the auth session before any screen renders.
 *
 * Flow:
 * 1. Load fonts (Inter family)
 * 2. Restore token from SecureStore → call GET /me
 * 3. Fetch AppConfig (with offline fallback)
 * 4. Check forced-update / maintenance
 * 5. Hide splash and route to the correct stack
 */

import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useConfigStore } from '../src/store/configStore';
import { getToken } from '../src/lib/secureStorage';
import { api } from '../src/api/client';
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
  const { login, setLoading } = useAuthStore();
  const { setConfig, loadCached } = useConfigStore();

  const bootstrap = useCallback(async () => {
    // 1. Load cached config so forced-update check works offline
    await loadCached();

    // 2. Try to restore session
    try {
      const token = await getToken();
      if (token) {
        const user = await api.getMe();
        await login(token, user);
      } else {
        setLoading(false);
      }
    } catch {
      // Token may be expired or network offline — treat as logged out
      setLoading(false);
    }

    // 3. Fetch fresh config (non-blocking for auth)
    try {
      const config = await api.getConfig();
      await setConfig(config);
    } catch {
      // Offline — continue with cached config
    }
  }, [login, setLoading, setConfig, loadCached]);

  useEffect(() => {
    bootstrap().then(() => {
      SplashScreen.hideAsync().catch(() => undefined);
    });
  }, [bootstrap]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)"         options={{ headerShown: false }} />
      <Stack.Screen name="(auth)"         options={{ headerShown: false }} />
      <Stack.Screen name="startup"        options={{ headerShown: false }} />
      <Stack.Screen name="+not-found"     options={{ title: 'Not Found' }} />
    </Stack>
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
  root: { flex: 1 },
});
