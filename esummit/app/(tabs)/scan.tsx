/**
 * Scan tab — placeholder for Phase 9.
 *
 * This tab only appears when user.features.scanner === true (tab layout
 * sets href=null otherwise). Server enforces the role on every API call.
 *
 * Phase 9 will add: mode picker (Attendance / Kit / Event), camera,
 * offline pack download, result screen, and sync status.
 * Do NOT implement camera or QR scanning here.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../../src/components';
import { useAuthStore, selectUser } from '../../src/store/authStore';
import { colors, typography, spacing } from '../../src/theme';
import { QrCode, ShieldCheck } from 'lucide-react-native';

export default function ScanScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);

  return (
    <Screen>
      <View style={styles.container}>
        <QrCode size={56} color={colors.primary} strokeWidth={1.5} />
        <Text style={styles.title}>Scan</Text>
        {user && (
          <View style={styles.roleRow}>
            <ShieldCheck size={14} color={colors.success} strokeWidth={2} />
            <Text style={styles.roleText}>
              {user.role === 'ADMIN' ? 'Admin' : 'Organizer'} access
            </Text>
          </View>
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PHASE 9 — QR SCANNER</Text>
        </View>
        <Text style={styles.note}>
          Three scan modes will be available:{'\n'}
          Attendance · Kit collection · Event check-in
          {'\n\n'}
          Includes offline pack, device queue, and conflict handling.
          Camera and scanning are not implemented in Phase 3.
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
  roleRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing['2'],
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing['3'],
    paddingVertical:   spacing['1'],
    borderRadius:    99,
  },
  roleText: {
    fontFamily: typography.fontFamilyMedium,
    fontSize:   typography.sizeSm,
    color:      colors.success,
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
