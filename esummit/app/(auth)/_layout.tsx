/**
 * Auth stack layout — contains all authentication and account management routes.
 *
 * Routes:
 * - welcome: Entry landing screen for unauthenticated visitors
 * - login: Email/password + social login
 * - signup: Registration form with password validation rules
 * - forgot-password: Password reset link dispatch
 * - verify-pending: Pending email verification notice & refetch
 * - onboarding: First-time profile details entry
 * - profile: Native profile management (edit fields, photo, notifications, logout, delete)
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function AuthLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome"         options={{ headerShown: false }} />
      <Stack.Screen name="login"           options={{ headerShown: false }} />
      <Stack.Screen name="signup"          options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="verify-pending"  options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"      options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="profile"         options={{ headerShown: false }} />
    </Stack>
  );
}
