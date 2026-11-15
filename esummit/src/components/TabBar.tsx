/**
 * TabBar — floating, rounded bottom tab bar.
 * Active tab: icon inside a small primary pill + white label.
 * Inactive: muted icon + muted label.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CalendarDays, House, MapPin, Ticket, User, type LucideIcon } from 'lucide-react-native';
import {
  colors,
  fontFamily,
  fontSize,
  radius,
  screenPadding,
  shadows,
  spacing,
  tabBarBottomOffset,
  tabBarHeight,
} from '../theme';

/** Route name → icon. Keys must match files in app/(tabs). */
const ICONS: Record<string, LucideIcon> = {
  index: House,
  events: CalendarDays,
  map: MapPin,
  passes: Ticket,
  profile: User,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, tabBarBottomOffset) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const Icon = ICONS[route.name] ?? House;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              style={styles.tab}
            >
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <Icon
                  size={20}
                  color={focused ? colors.onPrimary : colors.textMuted}
                  strokeWidth={focused ? 2.25 : 1.75}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, { color: focused ? colors.text : colors.textMuted }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: screenPadding,
    right: screenPadding,
  },
  bar: {
    flexDirection: 'row',
    height: tabBarHeight,
    backgroundColor: colors.card,
    borderRadius: radius.tabBar,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing['1'],
    ...shadows.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconPill: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: { backgroundColor: colors.primary },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xxs + 1,
  },
});
