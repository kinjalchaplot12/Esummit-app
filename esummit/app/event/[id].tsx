/**
 * Event detail — /event/[id]
 * Registration is a placeholder until the backend is connected
 * (POST /events/{slug}/register, see mobile-api-v1.md §3.3.3).
 */

import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  categoryIcons,
  EmptyState,
  IconButton,
  Screen,
  SectionTitle,
} from '../../src/components';
import { getEventById } from '../../src/data/placeholder';
import type { SummitEvent } from '../../src/data/types';
import { formatShortDate } from '../../src/lib/format';
import { colors, fontFamily, fontSize, minTouchTarget, radius, screenPadding, spacing } from '../../src/theme';

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={18} color={colors.accent} strokeWidth={1.75} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function registerState(e: SummitEvent): { label: string; enabled: boolean } {
  if (e.isRegistered) return { label: 'Registered', enabled: false };
  if (!e.registrationEnabled || e.registrationStatus === 'NOT_STARTED')
    return { label: 'Registration opens soon', enabled: false };
  if (e.registrationStatus === 'CLOSED') return { label: 'Registration closed', enabled: false };
  if (e.seatsLeft !== null && e.seatsLeft <= 0) return { label: 'Event full', enabled: false };
  return { label: 'Register', enabled: true };
}

export default function EventDetailScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = id ? getEventById(id) : undefined;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/events'));

  if (!event) {
    return (
      <Screen>
        <IconButton icon={ArrowLeft} onPress={goBack} accessibilityLabel="Go back" />
        <EmptyState title="Event not found" body="This event may have been removed." />
      </Screen>
    );
  }

  const Icon = categoryIcons[event.category];
  const reg = registerState(event);
  const seats =
    event.seatsTotal === null
      ? 'Open entry'
      : `${event.seatsLeft ?? 0} of ${event.seatsTotal} left`;

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={styles.scroll}>
      <View style={styles.topBar}>
        <IconButton icon={ArrowLeft} onPress={goBack} accessibilityLabel="Go back" />
      </View>

      <View style={styles.media}>
        {event.image ? (
          <Image source={{ uri: event.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Icon size={48} color={colors.textMuted} strokeWidth={1.25} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.badges}>
          <Badge label={event.category} />
          <Badge label={`Day ${event.day}`} tone="neutral" />
        </View>
        <Text style={styles.title}>{event.name}</Text>

        <View style={styles.infoCard}>
          <InfoRow icon={CalendarDays} label="Date" value={formatShortDate(event.date)} />
          <InfoRow icon={Clock} label="Time" value={`${event.startTime} – ${event.endTime}`} />
          <InfoRow icon={MapPin} label="Venue" value={event.venue} />
          {event.prizePool ? <InfoRow icon={Trophy} label="Prize pool" value={event.prizePool} /> : null}
          <InfoRow icon={Users} label="Seats" value={seats} />
        </View>

        <SectionTitle title="About" style={styles.sectionTitle} />
        <Text style={styles.paragraph}>{event.description}</Text>

        {event.rules.length > 0 ? (
          <>
            <SectionTitle title="Rules" style={styles.sectionTitle} />
            <View style={styles.rules}>
              {event.rules.map((rule, i) => (
                <View key={i} style={styles.rule}>
                  <Text style={styles.ruleNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <SectionTitle title="Coordinator" style={styles.sectionTitle} />
        <Pressable
          style={styles.coordinator}
          onPress={() => Linking.openURL(`tel:${event.coordinator.phone.replace(/\s/g, '')}`)}
          accessibilityRole="button"
          accessibilityLabel={`Call ${event.coordinator.name}`}
        >
          <View>
            <Text style={styles.infoValue}>{event.coordinator.name}</Text>
            <Text style={styles.infoLabel}>{event.coordinator.phone}</Text>
          </View>
          <View style={styles.callButton}>
            <Phone size={18} color={colors.onPrimary} strokeWidth={2} />
          </View>
        </Pressable>

        <Button
          label={reg.label}
          disabled={!reg.enabled}
          onPress={() =>
            Alert.alert('Coming soon', 'Registration will open once the app is connected.')
          }
          fullWidth
          size="lg"
          style={styles.register}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: spacing['8'] },
  topBar: { paddingHorizontal: screenPadding, paddingVertical: spacing['2'] },
  media: {
    marginHorizontal: screenPadding,
    aspectRatio: 16 / 10,
    borderRadius: radius.cardLg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  body: { paddingHorizontal: screenPadding, paddingTop: spacing['5'] },
  badges: { flexDirection: 'row', gap: spacing['2'] },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['3xl'],
    color: colors.text,
    marginTop: spacing['3'],
    marginBottom: spacing['5'],
  },
  infoCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['4'],
    gap: spacing['4'],
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['3'] },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.textMuted },
  infoValue: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.base, color: colors.text },
  sectionTitle: { marginTop: spacing['6'] },
  paragraph: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    lineHeight: fontSize.base * 1.6,
  },
  rules: { gap: spacing['3'] },
  rule: { flexDirection: 'row', gap: spacing['3'] },
  ruleNum: { fontFamily: fontFamily.heading, fontSize: fontSize.base, color: colors.accent },
  ruleText: { flex: 1, fontFamily: fontFamily.body, fontSize: fontSize.base, color: colors.text },
  coordinator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['4'],
  },
  callButton: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: minTouchTarget / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  register: { marginTop: spacing['8'] },
});
