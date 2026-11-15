/**
 * Profile tab — account card, links (edit profile, speakers, scanner) and FAQ.
 * Guests see a log-in prompt; everything else is browsable.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import {
  ChevronDown,
  ChevronRight,
  Mic,
  QrCode,
  UserPen,
  type LucideIcon,
} from 'lucide-react-native';
import { Button, Header, Screen, SectionTitle } from '../../src/components';
import { faq } from '../../src/data/placeholder';
import { initials } from '../../src/lib/format';
import { useAuthStore, selectHasScanner, selectUser } from '../../src/store/authStore';
import {
  colors,
  fontFamily,
  fontSize,
  minTouchTarget,
  radius,
  screenPadding,
  spacing,
  tabBarClearance,
} from '../../src/theme';

interface LinkRow {
  label: string;
  icon: LucideIcon;
  href: Href;
}

export default function ProfileScreen(): React.JSX.Element {
  const user = useAuthStore(selectUser);
  const hasScanner = useAuthStore(selectHasScanner);
  const logout = useAuthStore((s) => s.logout);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const links: LinkRow[] = [
    ...(user ? [{ label: 'Edit profile', icon: UserPen, href: '/(auth)/edit-profile' as Href }] : []),
    { label: 'Speakers', icon: Mic, href: '/speakers' },
    ...(hasScanner ? [{ label: 'Scanner', icon: QrCode, href: '/scanner' as Href }] : []),
  ];

  return (
    <Screen scroll edges={['top']} contentStyle={styles.scroll}>
      <Header title="Profile" />

      <View style={styles.body}>
        {/* Account */}
        <View style={styles.card}>
          {user ? (
            <View style={styles.account}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(user.name)}</Text>
              </View>
              <View style={styles.accountText}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.guest}>
              <Text style={styles.name}>You are browsing as a guest</Text>
              <Text style={styles.email}>Log in to see your pass and register for events.</Text>
              <Button label="Log in" onPress={() => router.push('/(auth)/login')} fullWidth />
              <Button
                label="Create account"
                variant="secondary"
                onPress={() => router.push('/(auth)/signup')}
                fullWidth
              />
            </View>
          )}
        </View>

        {/* Links */}
        <View style={styles.card}>
          {links.map((link, i) => (
            <Pressable
              key={link.label}
              onPress={() => router.push(link.href)}
              accessibilityRole="button"
              style={[styles.linkRow, i > 0 && styles.divider]}
            >
              <link.icon size={20} color={colors.accent} strokeWidth={1.75} />
              <Text style={styles.linkLabel}>{link.label}</Text>
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.75} />
            </Pressable>
          ))}
        </View>

        {/* FAQ */}
        <SectionTitle title="FAQ" style={styles.faqTitle} />
        <View style={styles.card}>
          {faq.map((item, i) => {
            const open = openFaq === item.id;
            return (
              <View key={item.id} style={i > 0 && styles.divider}>
                <Pressable
                  onPress={() => setOpenFaq(open ? null : item.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  style={styles.faqRow}
                >
                  <Text style={styles.faqQ}>{item.question}</Text>
                  <ChevronDown
                    size={18}
                    color={colors.textMuted}
                    strokeWidth={1.75}
                    style={open ? styles.rotated : undefined}
                  />
                </Pressable>
                {open ? <Text style={styles.faqA}>{item.answer}</Text> : null}
              </View>
            );
          })}
        </View>

        {user ? (
          <Button label="Log out" variant="secondary" onPress={() => void logout()} fullWidth />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: tabBarClearance },
  body: { paddingHorizontal: screenPadding, gap: spacing['4'] },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: spacing['4'],
  },
  account: { flexDirection: 'row', alignItems: 'center', gap: spacing['4'], paddingVertical: spacing['4'] },
  accountText: { flex: 1 },
  guest: { gap: spacing['3'], paddingVertical: spacing['5'] },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.heading, fontSize: fontSize.xl, color: colors.onAccent },
  name: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.lg, color: colors.text },
  email: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.textMuted },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: minTouchTarget + 8,
  },
  linkLabel: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base, color: colors.text },
  divider: { borderTopWidth: 1, borderTopColor: colors.cardBorder },
  faqTitle: { marginTop: spacing['4'], marginBottom: 0 },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: minTouchTarget + 8,
  },
  faqQ: { flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: fontSize.base, color: colors.text },
  faqA: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: fontSize.sm * 1.6,
    paddingBottom: spacing['4'],
  },
  rotated: { transform: [{ rotate: '180deg' }] },
});
