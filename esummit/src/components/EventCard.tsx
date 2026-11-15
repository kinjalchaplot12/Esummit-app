/**
 * EventCard — square card for an event. Size is set by the parent
 * (pass `size`, or let it fill its column with aspectRatio 1).
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import {
  Clock,
  Lightbulb,
  Mic,
  Presentation,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import type { EventCategory, SummitEvent } from '../data/types';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme';
import { Badge } from './Badge';

export const categoryIcons: Record<EventCategory, LucideIcon> = {
  Competition: Trophy,
  Talk: Mic,
  Workshop: Lightbulb,
  Networking: Users,
  Showcase: Presentation,
};

interface EventCardProps {
  event: SummitEvent;
  /** Fixed width/height. Omit to fill the parent's width. */
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EventCard({ event, size, onPress, style }: EventCardProps) {
  const Icon = categoryIcons[event.category];
  const handlePress = onPress ?? (() => router.push(`/event/${event.id}`));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${event.category}, ${event.startTime} at ${event.venue}`}
      style={({ pressed }) => [
        styles.card,
        size ? { width: size, height: size } : styles.fill,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.media}>
        {event.image ? (
          <Image source={{ uri: event.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Icon size={28} color={colors.textMuted} strokeWidth={1.5} />
        )}
        <Badge label={event.category} style={styles.badge} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {event.name}
        </Text>
        <View style={styles.meta}>
          <Clock size={12} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.startTime} · {event.venue}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  fill: { width: '100%', aspectRatio: 1 },
  pressed: { opacity: 0.85 },
  media: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute', top: spacing['2'], left: spacing['2'] },
  body: {
    padding: spacing['3'],
    gap: spacing['1'],
  },
  name: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize.base,
    color: colors.text,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing['1'] },
  metaText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
