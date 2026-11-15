/**
 * Map tab — campus places by category, with "Directions" via the
 * Google Maps universal URL (no API key, works on both platforms).
 * An in-app pin map can be added later (react-native-maps).
 */

import React, { useMemo, useState } from 'react';
import { FlatList, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Building2,
  Cross,
  DoorOpen,
  LifeBuoy,
  MapPin,
  Navigation,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';
import { Button, Chip, Header, Screen } from '../../src/components';
import { venues } from '../../src/data/placeholder';
import type { Venue, VenueCategory } from '../../src/data/types';
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  screenPadding,
  spacing,
  tabBarClearance,
} from '../../src/theme';

const CATEGORY_LABELS: Partial<Record<VenueCategory, string>> = {
  VENUE: 'Venues',
  HELP_DESK: 'Help desk',
  FOOD: 'Canteens',
  MEDICAL: 'Medical',
  GATE: 'Gates',
};

const CATEGORY_ICONS: Partial<Record<VenueCategory, LucideIcon>> = {
  VENUE: Building2,
  HELP_DESK: LifeBuoy,
  FOOD: UtensilsCrossed,
  MEDICAL: Cross,
  GATE: DoorOpen,
};

function openDirections(v: Venue) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}`;
  Linking.openURL(url).catch(() => undefined);
}

export default function MapScreen(): React.JSX.Element {
  const [category, setCategory] = useState<VenueCategory | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(venues.map((v) => v.category))),
    [],
  );
  const filtered = category ? venues.filter((v) => v.category === category) : venues;

  const header = (
    <View>
      <Header title="Campus map" subtitle="Find venues, help desks and essentials" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label="All" selected={category === null} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_LABELS[c] ?? c}
            selected={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const Icon = CATEGORY_ICONS[item.category] ?? MapPin;
          return (
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Icon size={22} color={colors.accent} strokeWidth={1.75} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.coords}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
              </View>
              <Button
                label="Go"
                size="sm"
                variant="ghost"
                onPress={() => openDirections(item)}
                accessibilityLabel={`Directions to ${item.name}`}
                leftIcon={<Navigation size={14} color={colors.text} strokeWidth={2} />}
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: tabBarClearance },
  chips: { gap: spacing['2'], paddingHorizontal: screenPadding, marginBottom: spacing['4'] },
  gap: { height: spacing['3'] },
  card: {
    marginHorizontal: screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['4'],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  name: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.base, color: colors.text },
  desc: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.textMuted },
  coords: { fontFamily: fontFamily.headingMedium, fontSize: fontSize.xs, color: colors.textDim },
});
