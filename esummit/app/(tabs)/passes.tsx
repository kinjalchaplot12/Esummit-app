/**
 * Passes tab — the user's pass card (brand gradient) and available tiers.
 * Buying / QR generation are out of scope for the frontend-only phase.
 */

import React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, QrCode } from 'lucide-react-native';
import { Badge, Button, Header, Screen, SectionTitle } from '../../src/components';
import { passTiers, summit } from '../../src/data/placeholder';
import { formatPrice } from '../../src/lib/format';
import { useAuthStore, selectUser } from '../../src/store/authStore';
import {
  brandGradient,
  colors,
  fontFamily,
  fontSize,
  radius,
  screenPadding,
  spacing,
  tabBarClearance,
} from '../../src/theme';

function comingSoon() {
  Alert.alert('Coming soon', 'Pass purchase will be available once the app is connected.');
}

export default function PassesScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);

  return (
    <Screen scroll edges={['top']} contentStyle={styles.scroll}>
      <Header title="Passes" subtitle="Your entry to every day of the summit" />

      {/* Pass card — the ONLY place the brand gradient is used */}
      <LinearGradient
        colors={brandGradient.colors}
        start={brandGradient.start}
        end={brandGradient.end}
        style={styles.passCard}
      >
        <View style={styles.passTop}>
          <View>
            <Text style={styles.passLabel}>{summit.shortName}</Text>
            <Text style={styles.passDates}>{summit.datesLabel}</Text>
          </View>
          <Image source={summit.logo} style={styles.passLogo} resizeMode="contain" />
        </View>

        <View style={styles.passMiddle}>
          <View style={styles.qrBox}>
            <QrCode size={56} color={colors.text} strokeWidth={1.25} />
          </View>
        </View>

        <View>
          <Text style={styles.passHolderLabel}>{user ? 'Pass holder' : 'No pass yet'}</Text>
          <Text style={styles.passHolder}>{user ? user.name : 'Log in to see your pass'}</Text>
        </View>
      </LinearGradient>

      {!user ? (
        <Button
          label="Log in"
          onPress={() => router.push('/(auth)/login')}
          fullWidth
          style={styles.loginButton}
        />
      ) : null}

      <View style={styles.tiers}>
        <SectionTitle title="Pass tiers" />
        {passTiers.map((tier) => (
          <View key={tier.id} style={[styles.tier, tier.highlight && styles.tierHighlight]}>
            <View style={styles.tierHead}>
              <View style={styles.tierTitle}>
                <Text style={styles.tierName}>{tier.name}</Text>
                {tier.highlight ? <Badge label="Popular" /> : null}
                {tier.isFreeForMnitOnly ? <Badge label="Students only" tone="neutral" /> : null}
              </View>
              <Text style={styles.price}>{formatPrice(tier.price)}</Text>
            </View>
            <Text style={styles.tierDesc}>{tier.description}</Text>
            <View style={styles.perks}>
              {tier.perks.map((perk) => (
                <View key={perk} style={styles.perk}>
                  <Check size={16} color={colors.accent} strokeWidth={2} />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
            <Button
              label={tier.price === 0 ? 'Claim pass' : 'Get pass'}
              variant={tier.highlight ? 'primary' : 'secondary'}
              onPress={comingSoon}
              fullWidth
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: tabBarClearance },
  passCard: {
    marginHorizontal: screenPadding,
    borderRadius: radius.cardLg,
    padding: spacing['5'],
    gap: spacing['5'],
  },
  passTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  passLabel: { fontFamily: fontFamily.heading, fontSize: fontSize['2xl'], color: colors.text },
  passDates: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, color: colors.text },
  passLogo: { width: 36, height: 36 },
  passMiddle: { alignItems: 'center' },
  qrBox: {
    width: 120,
    height: 120,
    borderRadius: radius.card,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passHolderLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.text },
  passHolder: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.lg, color: colors.text },
  loginButton: { marginTop: spacing['4'], marginHorizontal: screenPadding, width: 'auto' },
  tiers: { paddingHorizontal: screenPadding, marginTop: spacing['8'], gap: spacing['3'] },
  tier: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['5'],
    gap: spacing['3'],
  },
  tierHighlight: { borderColor: colors.primary },
  tierHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tierTitle: { flex: 1, gap: spacing['2'] },
  tierName: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: colors.text },
  price: { fontFamily: fontFamily.heading, fontSize: fontSize['2xl'], color: colors.text },
  tierDesc: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.textMuted },
  perks: { gap: spacing['2'] },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  perkText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.text },
});
