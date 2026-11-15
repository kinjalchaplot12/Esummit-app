/**
 * Scanner — full-screen route for volunteers / members (/scanner).
 * Linked from Profile only when the user has scanner access; the server
 * enforces the role on every scan call (app spec §6.3).
 *
 * Placeholder: camera + QR scanning are out of scope for the frontend phase.
 * Planned modes: Attendance · Kit collection · Event check-in.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { QrCode, X } from 'lucide-react-native';
import { Chip, IconButton, Screen } from '../src/components';
import { colors, fontFamily, fontSize, radius, screenPadding, spacing } from '../src/theme';

const MODES = ['Attendance', 'Kit', 'Event check-in'] as const;

export default function ScannerScreen(): React.JSX.Element {
  const [mode, setMode] = useState<(typeof MODES)[number]>('Attendance');
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'));

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Scanner</Text>
        <IconButton icon={X} onPress={close} accessibilityLabel="Close scanner" />
      </View>

      <View style={styles.modes}>
        {MODES.map((m) => (
          <Chip key={m} label={m} selected={mode === m} onPress={() => setMode(m)} />
        ))}
      </View>

      <View style={styles.viewfinder}>
        <QrCode size={72} color={colors.textMuted} strokeWidth={1.25} />
        <Text style={styles.note}>Camera preview will appear here.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: screenPadding, gap: spacing['5'] },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing['2'],
  },
  title: { fontFamily: fontFamily.heading, fontSize: fontSize['3xl'], color: colors.text },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] },
  viewfinder: {
    flex: 1,
    marginBottom: spacing['6'],
    borderRadius: radius.cardLg,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
  },
  note: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.textMuted },
});
