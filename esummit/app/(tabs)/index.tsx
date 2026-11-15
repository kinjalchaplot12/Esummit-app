/**
 * Home tab — summit overview, quick stats, today's events and featured speakers.
 * All content comes from src/data/placeholder.ts.
 */

import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, MapPin } from 'lucide-react-native';
import { Badge, EventCard, Header, Screen, SectionTitle } from '../../src/components';
import { events, getEventsByDay, speakers, summit } from '../../src/data/placeholder';
import { initials } from '../../src/lib/format';
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  screenPadding,
  spacing,
  tabBarClearance,
} from '../../src/theme';

const CARD_SIZE = 168;

export default function HomeScreen(): React.JSX.Element {
  const dayOneEvents = getEventsByDay(1);
  const featuredSpeakers = speakers.filter((s) => s.isFeatured);

  const stats = [
    { value: String(summit.days.length), label: 'Days' },
    { value: String(events.length), label: 'Events' },
    { value: String(speakers.length), label: 'Speakers' },
  ];

  return (
    <Screen scroll edges={['top']} contentStyle={styles.scroll}>
      <Header />

      {/* Hero */}
      <View style={[styles.section, styles.hero]}>
        <Badge label={summit.organizer} />
        <Text style={styles.heroTitle}>{summit.name}</Text>
        <Text style={styles.heroTagline}>{summit.tagline}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.metaRow}>
            <CalendarDays size={16} color={colors.textMuted} strokeWidth={1.75} />
            <Text style={styles.metaText}>{summit.datesLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={16} color={colors.textMuted} strokeWidth={1.75} />
            <Text style={styles.metaText}>{summit.location}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.section, styles.stats]}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Day 1 events */}
      <View style={styles.sectionHeader}>
        <SectionTitle
          title="Day 1 events"
          actionLabel="See all"
          onActionPress={() => router.push('/(tabs)/events')}
        />
      </View>
      <FlatList
        horizontal
        data={dayOneEvents}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EventCard event={item} size={CARD_SIZE} />}
        contentContainerStyle={styles.hList}
        ItemSeparatorComponent={() => <View style={styles.hGap} />}
        showsHorizontalScrollIndicator={false}
      />

      {/* Speakers */}
      <View style={[styles.sectionHeader, styles.spaced]}>
        <SectionTitle
          title="Speakers"
          actionLabel="See all"
          onActionPress={() => router.push('/speakers')}
        />
      </View>
      <FlatList
        horizontal
        data={featuredSpeakers}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.speaker}
            onPress={() => router.push('/speakers')}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.designation}`}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <Text style={styles.speakerName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.speakerOrg} numberOfLines={1}>
              {item.organization}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.hList}
        ItemSeparatorComponent={() => <View style={styles.hGap} />}
        showsHorizontalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: tabBarClearance },
  section: { marginHorizontal: screenPadding },
  sectionHeader: { paddingHorizontal: screenPadding, marginTop: spacing['8'] },
  spaced: { marginTop: spacing['8'] },
  hero: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.cardLg,
    padding: spacing['5'],
    gap: spacing['3'],
  },
  heroTitle: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['4xl'],
    color: colors.text,
    letterSpacing: -0.5,
  },
  heroTagline: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    lineHeight: fontSize.base * 1.5,
  },
  heroMeta: { gap: spacing['2'], marginTop: spacing['1'] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing['2'] },
  metaText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: spacing['3'], marginTop: spacing['3'] },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingVertical: spacing['4'],
    alignItems: 'center',
  },
  statValue: { fontFamily: fontFamily.heading, fontSize: fontSize['2xl'], color: colors.text },
  statLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.textMuted },
  hList: { paddingHorizontal: screenPadding },
  hGap: { width: spacing['3'] },
  speaker: {
    width: 120,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['3'],
    alignItems: 'center',
    gap: spacing['1'],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['1'],
  },
  avatarText: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: colors.onAccent },
  speakerName: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  speakerOrg: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.textMuted },
});
