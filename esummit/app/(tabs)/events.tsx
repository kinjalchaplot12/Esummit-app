/**
 * Events tab — search, day + category filters, square card grid.
 */

import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Search } from 'lucide-react-native';
import { Chip, EventCard, Header, Input, Screen } from '../../src/components';
import { events, summit } from '../../src/data/placeholder';
import type { EventCategory } from '../../src/data/types';
import {
  colors,
  fontFamily,
  fontSize,
  screenPadding,
  spacing,
  tabBarClearance,
} from '../../src/theme';

const CATEGORIES: EventCategory[] = ['Competition', 'Talk', 'Workshop', 'Networking', 'Showcase'];
const GAP = spacing['3'];

export default function EventsScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [day, setDay] = useState<number | null>(null);
  const [category, setCategory] = useState<EventCategory | null>(null);

  const cardSize = (width - screenPadding * 2 - GAP) / 2;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        (day === null || e.day === day) &&
        (category === null || e.category === category) &&
        (q === '' || e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)),
    );
  }, [query, day, category]);

  const header = (
    <View>
      <Header title="Events" subtitle={summit.datesLabel} />
      <View style={styles.filters}>
        <Input
          placeholder="Search events or venues"
          value={query}
          onChangeText={setQuery}
          leftIcon={<Search size={18} color={colors.textMuted} strokeWidth={1.75} />}
          returnKeyType="search"
          containerStyle={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All days" selected={day === null} onPress={() => setDay(null)} />
          {summit.days.map((d) => (
            <Chip
              key={d.day}
              label={d.label}
              selected={day === d.day}
              onPress={() => setDay(d.day)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" selected={category === null} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        numColumns={2}
        ListHeaderComponent={header}
        renderItem={({ item }) => <EventCard event={item} size={cardSize} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No events match these filters.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: tabBarClearance },
  filters: { gap: spacing['3'], marginBottom: spacing['4'] },
  search: { marginHorizontal: screenPadding },
  chips: { gap: spacing['2'], paddingHorizontal: screenPadding },
  row: { gap: GAP, paddingHorizontal: screenPadding, marginBottom: GAP },
  empty: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['10'],
  },
});
