/**
 * 404 Not Found screen — fallback for unmatched Expo Router URLs.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Screen, Button } from '../src/components';
import { colors, typography, spacing, radii } from '../src/theme';
import { HelpCircle } from 'lucide-react-native';

export default function NotFoundScreen(): React.JSX.Element {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: false }} />
      <Screen contentStyle={styles.container}>
        <View style={styles.iconCircle}>
          <HelpCircle size={48} color={colors.textTertiary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>Screen not found</Text>
        <Text style={styles.body}>
          The link you opened doesn't exist or may have been moved.
        </Text>
        <Link href="/(tabs)" asChild>
          <Button label="Return to Home" onPress={() => undefined} style={styles.button} />
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['6'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.size2xl,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.sizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['2'],
    marginBottom: spacing['6'],
  },
  button: {
    minWidth: 160,
  },
});
