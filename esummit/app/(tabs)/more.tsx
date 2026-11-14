/**
 * More tab — SDUI placeholder.
 * Phase 4 will replace body with SDUI LinkList renderer.
 * Profile link is always present and routes to the native profile screen.
 * Guest browsing allowed.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components';
import { useAuthStore, selectIsLoggedIn, selectUser } from '../../src/store/authStore';
import { colors, typography, spacing, radii } from '../../src/theme';
import { User, ChevronRight, MoreHorizontal } from 'lucide-react-native';

export default function MoreScreen(): React.JSX.Element {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const user       = useAuthStore(selectUser);

  return (
    <Screen scroll>
      <Text style={styles.heading}>More</Text>

      {/* Profile row — always shown */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(isLoggedIn ? '/(auth)/profile' : '/(auth)/login')}
        accessibilityRole="button"
        accessibilityLabel={isLoggedIn ? 'View profile' : 'Log in to view profile'}
      >
        <View style={styles.rowIcon}>
          <User size={20} color={colors.primary} strokeWidth={1.75} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>{isLoggedIn ? user?.name ?? 'Profile' : 'Log in'}</Text>
          <Text style={styles.rowSub}>{isLoggedIn ? user?.email : 'Tap to sign in or create an account'}</Text>
        </View>
        <ChevronRight size={16} color={colors.textTertiary} strokeWidth={1.75} />
      </TouchableOpacity>

      {/* SDUI placeholder notice */}
      <View style={styles.placeholder}>
        <MoreHorizontal size={32} color={colors.textTertiary} strokeWidth={1.5} />
        <Text style={styles.placeholderTitle}>Phase 4 — SDUI Menu</Text>
        <Text style={styles.placeholderNote}>
          FAQ, Help, Speakers, Sponsors, and Live Updates links will be loaded
          from the server-driven More menu in Phase 4.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily:    typography.fontFamilyBold,
    fontSize:      typography.size3xl,
    color:         colors.textPrimary,
    marginBottom:  spacing['6'],
  },
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    radii.lg,
    padding:         spacing['4'],
    marginBottom:    spacing['3'],
    gap:             spacing['3'],
  },
  rowIcon: {
    width:           40,
    height:          40,
    borderRadius:    radii.md,
    backgroundColor: colors.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: typography.fontFamilySemiBold,
    fontSize:   typography.sizeMd,
    color:      colors.textPrimary,
  },
  rowSub: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeXs,
    color:       colors.textTertiary,
    marginTop:   2,
  },
  placeholder: {
    marginTop:   spacing['8'],
    alignItems:  'center',
    gap:         spacing['3'],
    padding:     spacing['6'],
  },
  placeholderTitle: {
    fontFamily:  typography.fontFamilySemiBold,
    fontSize:    typography.sizeSm,
    color:       colors.textTertiary,
    letterSpacing: typography.trackingWidest,
  },
  placeholderNote: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeSm,
    color:       colors.textTertiary,
    textAlign:   'center',
    lineHeight:  typography.sizeSm * typography.lineHeightRelaxed,
  },
});
