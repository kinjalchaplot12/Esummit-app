/** Speakers — full list. /speakers */

import React from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Linkedin } from 'lucide-react-native';
import { Badge, IconButton, Screen } from '../src/components';
import { speakers } from '../src/data/placeholder';
import { initials } from '../src/lib/format';
import { colors, fontFamily, fontSize, radius, screenPadding, spacing } from '../src/theme';

export default function SpeakersScreen(): React.JSX.Element {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <Screen edges={['top']}>
      <FlatList
        data={speakers}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <IconButton icon={ArrowLeft} onPress={goBack} accessibilityLabel="Go back" />
            <Text style={styles.title} accessibilityRole="header">
              Speakers
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.name)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.role}>
                {item.designation}, {item.organization}
              </Text>
              {item.bio ? (
                <Text style={styles.bio} numberOfLines={3}>
                  {item.bio}
                </Text>
              ) : null}
              {item.isFeatured ? <Badge label="Featured" style={styles.badge} /> : null}
            </View>
            {item.linkedinUrl ? (
              <Pressable
                onPress={() => Linking.openURL(item.linkedinUrl!)}
                accessibilityRole="link"
                accessibilityLabel={`${item.name} on LinkedIn`}
                style={styles.link}
              >
                <Linkedin size={18} color={colors.textMuted} strokeWidth={1.75} />
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: screenPadding, paddingBottom: spacing['10'] },
  header: { paddingTop: spacing['2'], paddingBottom: spacing['5'], gap: spacing['4'] },
  title: { fontFamily: fontFamily.heading, fontSize: fontSize['3xl'], color: colors.text },
  gap: { height: spacing['3'] },
  card: {
    flexDirection: 'row',
    gap: spacing['4'],
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing['4'],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.heading, fontSize: fontSize.lg, color: colors.onAccent },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: fontFamily.headingSemiBold, fontSize: fontSize.md, color: colors.text },
  role: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm, color: colors.textMuted },
  bio: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing['1'],
  },
  badge: { marginTop: spacing['2'] },
  link: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
