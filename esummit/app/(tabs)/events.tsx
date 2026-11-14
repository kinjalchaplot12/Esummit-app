/**
 * Events tab — SDUI placeholder.
 * Phase 5 will replace this with the event list + SDUI header + filters.
 * Guest browsing allowed.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme';
import { Calendar } from 'lucide-react-native';

export default function EventsScreen(): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.container}>
        <Calendar size={48} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Events</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 5 — EVENT LIST + DETAIL</Text>
        </View>
        <Text style={styles.note}>
          Browse events by day and category, view details, register, and add to calendar.
          {'\n\n'}Will use SDUI header + native list with register action.
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
    fontSize:      typography.size3xl,
    color:         colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing['4'],
    paddingVertical:   spacing['1'],
    borderRadius:      4,
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
  },
});
