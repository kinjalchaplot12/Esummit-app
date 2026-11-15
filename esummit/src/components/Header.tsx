/**
 * Header — top bar for the main tabs.
 * LEFT: "Log in" pill (logged out) or avatar circle with initials (logged in).
 * RIGHT: summit logo.
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, selectUser } from '../store/authStore';
import { summit } from '../data/placeholder';
import { initials } from '../lib/format';
import { colors, fontFamily, fontSize, minTouchTarget, screenPadding, spacing } from '../theme';
import { Button } from './Button';

interface HeaderProps {
  /** Optional title shown under the bar. */
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useAuthStore(selectUser);

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {user ? (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials(user.name) || '?'}</Text>
          </Pressable>
        ) : (
          <Button
            label="Log in"
            size="sm"
            onPress={() => router.push('/(auth)/login')}
            accessibilityLabel="Log in"
          />
        )}

        <Image
          source={summit.logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel={`${summit.shortName} logo`}
        />
      </View>

      {title ? (
        <View style={styles.titleBlock}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing['2'],
    paddingBottom: spacing['4'],
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: minTouchTarget,
  },
  avatar: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: minTouchTarget / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    color: colors.onAccent,
  },
  logo: { width: 40, height: 40 },
  titleBlock: { marginTop: spacing['5'] },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['3xl'],
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    marginTop: spacing['1'],
  },
});
