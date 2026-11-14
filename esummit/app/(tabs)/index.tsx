/**
 * Home tab — SDUI placeholder.
 *
 * Phase 4 will replace this body with the SDUI renderer.
 * The Screen wrapper and auth-awareness remain.
 * Guest browsing works: no login required.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme';
import { Layers } from 'lucide-react-native';

export default function HomeScreen(): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.container}>
        <Layers size={48} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>E-Summit</Text>
        <Text style={styles.subtitle}>MNIT Jaipur · E-Cell</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 4 — SDUI HOME</Text>
        </View>
        <Text style={styles.note}>
          This screen will be replaced by the Server-Driven UI renderer in Phase 4.
          {'\n\n'}Countdown, announcements, live events, quick actions, speakers, and sponsors
          will all load from the server without an app update.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        spacing['8'],
    gap:            spacing['4'],
  },
  title: {
    fontFamily:    typography.fontFamilyBold,
    fontSize:      typography.size4xl,
    color:         colors.textPrimary,
    letterSpacing: typography.trackingTight,
  },
  subtitle: {
    fontFamily: typography.fontFamilyMedium,
    fontSize:   typography.sizeMd,
    color:      colors.textSecondary,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing['4'],
    paddingVertical:   spacing['1'],
    borderRadius:      4,
    marginTop:         spacing['2'],
  },
  badgeText: {
    fontFamily:    typography.fontFamilySemiBold,
    fontSize:      typography.size3xs,
    color:         colors.primary,
    letterSpacing: typography.trackingWidest,
  },
  note: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeSm,
    color:       colors.textTertiary,
    textAlign:   'center',
    lineHeight:  typography.sizeSm * typography.lineHeightRelaxed,
    marginTop:   spacing['2'],
  },
});
