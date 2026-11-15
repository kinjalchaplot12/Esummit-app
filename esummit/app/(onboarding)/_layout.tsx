/**
 * Onboarding group — first-launch intro slides (/intro).
 * Separate from (auth)/onboarding, which collects profile details after signup.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function OnboardingLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    />
  );
}
