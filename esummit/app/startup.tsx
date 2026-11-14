/**
 * Startup screen — shown while the app checks AppConfig.
 *
 * Three outcomes after config loads:
 * 1. maintenanceMode = true → show MaintenanceScreen
 * 2. App version < minSupportedVersion → show ForcedUpdateScreen
 * 3. Otherwise → route to (tabs)
 *
 * This screen is pushed from the root layout when needed.
 * In Phase 3 the root layout handles routing; this file
 * exports sub-screens used there.
 */

import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useConfigStore } from '../src/store/configStore';
import { isUpdateRequired } from '../src/lib/errors';
import { colors, typography, spacing } from '../src/theme';
import { Screen, Button, LoadingState } from '../src/components';
import ENV from '../src/config/env';
import { AlertTriangle, Wrench } from 'lucide-react-native';

// ─── Maintenance screen ───────────────────────────────────────────────────────

export function MaintenanceScreen(): React.JSX.Element {
  const config = useConfigStore((s) => s.config);
  return (
    <Screen style={styles.centered}>
      <View style={styles.center}>
        <Wrench size={56} color={colors.warning} strokeWidth={1.5} />
        <Text style={styles.heading}>Down for maintenance</Text>
        <Text style={styles.body}>
          {config?.maintenanceMessage ?? 'We are performing scheduled maintenance. Please check back shortly.'}
        </Text>
      </View>
    </Screen>
  );
}

// ─── Forced update screen ─────────────────────────────────────────────────────

export function ForcedUpdateScreen(): React.JSX.Element {
  const config = useConfigStore((s) => s.config);

  const openStore = () => {
    const url = Platform.OS === 'ios'
      ? (config?.iosStoreUrl ?? '')
      : (config?.androidStoreUrl ?? '');
    if (url) Linking.openURL(url).catch(() => undefined);
  };

  return (
    <Screen style={styles.centered}>
      <View style={styles.center}>
        <AlertTriangle size={56} color={colors.warning} strokeWidth={1.5} />
        <Text style={styles.heading}>Update required</Text>
        <Text style={styles.body}>
          A newer version of E-Summit is required to continue. Please update from the store.
        </Text>
        <Button
          label="Update now"
          onPress={openStore}
          fullWidth
          style={styles.button}
          accessibilityLabel="Open app store to update"
        />
      </View>
    </Screen>
  );
}

// ─── Startup guard hook (used by root layout) ─────────────────────────────────

/**
 * Returns 'loading' | 'maintenance' | 'update' | 'ok'.
 * The root layout uses this to decide what to render.
 */
export function useStartupState(): 'loading' | 'maintenance' | 'update' | 'ok' {
  const config = useConfigStore((s) => s.config);
  if (!config) return 'loading';
  if (config.maintenanceMode) return 'maintenance';

  const minVersion = Platform.OS === 'ios'
    ? config.minSupportedVersionIos
    : config.minSupportedVersionAndroid;

  if (isUpdateRequired(ENV.APP_VERSION, minVersion)) return 'update';
  return 'ok';
}

// ─── Default export (Expo Router needs a default export per file) ─────────────

export default function StartupRoute(): React.JSX.Element {
  // This route is used as a redirect target; it shouldn't render visibly.
  // Push happens from _layout after bootstrap.
  return <LoadingState label="Starting E-Summit..." />;
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        spacing['8'],
    gap:            spacing['4'],
  },
  heading: {
    fontFamily:  typography.fontFamilyBold,
    fontSize:    typography.size3xl,
    color:       colors.textPrimary,
    textAlign:   'center',
  },
  body: {
    fontFamily:  typography.fontFamilyRegular,
    fontSize:    typography.sizeMd,
    color:       colors.textSecondary,
    textAlign:   'center',
    lineHeight:  typography.sizeMd * typography.lineHeightNormal,
  },
  button: {
    marginTop: spacing['4'],
  },
});
