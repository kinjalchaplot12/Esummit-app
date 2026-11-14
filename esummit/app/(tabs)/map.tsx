/**
 * Map tab — SDUI placeholder.
 * Phase 6 will replace this with campus place list + location + Google Maps links.
 * Guest browsing allowed.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme';
import { MapPin } from 'lucide-react-native';

export default function MapScreen(): React.JSX.Element {
  return (
    <Screen>
      <View style={styles.container}>
        <MapPin size={48} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Campus Map</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 6 — CAMPUS PLACES + DIRECTIONS</Text>
        </View>
        <Text style={styles.note}>
          Browse campus places by category, search, see distance from your location,
          and open directions in Google Maps.
          {'\n\n'}Location permission is foreground-only and never sent to the server.
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
    fontFamily: typography.fontFamilyBold,
    fontSize:   typography.size3xl,
    color:      colors.textPrimary,
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
