/**
 * Bottom tab navigator (spec §3.1)
 *
 * Fixed tabs: Home | Events | Map | My Pass | More
 * Conditional sixth tab: Scan — shown only when user.features.scanner === true
 *
 * The tab bar is NATIVE and fixed so a bad SDUI layout can never break it.
 * Tab content screens are thin placeholders ready to receive SDUI or
 * native implementations in later phases.
 */

import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import {
  Home,
  Calendar,
  MapPin,
  Ticket,
  MoreHorizontal,
  QrCode,
} from 'lucide-react-native';
import { useAuthStore, selectHasScanner } from '../../src/store/authStore';
import { colors, typography } from '../../src/theme';

const TAB_ICON_SIZE   = 22;
const TAB_ICON_STROKE = 1.75;

function TabIcon({
  Icon,
  focused,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  focused: boolean;
}): React.JSX.Element {
  return (
    <Icon
      size={TAB_ICON_SIZE}
      color={focused ? colors.tabActive : colors.tabInactive}
      strokeWidth={focused ? 2.25 : TAB_ICON_STROKE}
    />
  );
}

export default function TabsLayout(): React.JSX.Element {
  const hasScanner = useAuthStore(selectHasScanner);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:   colors.tabBg,
          borderTopColor:    colors.tabBorder,
          borderTopWidth:    1,
          height:            Platform.OS === 'ios' ? 84 : 64,
          paddingBottom:     Platform.OS === 'ios' ? 24 : 8,
          paddingTop:        8,
        },
        tabBarActiveTintColor:   colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamilyMedium,
          fontSize:   10,
          marginTop:  2,
        },
      }}
    >
      {/* ── Home ──────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
        }}
      />

      {/* ── Events ────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarAccessibilityLabel: 'Events tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={Calendar} focused={focused} />,
        }}
      />

      {/* ── Map ───────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarAccessibilityLabel: 'Campus map tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={MapPin} focused={focused} />,
        }}
      />

      {/* ── My Pass ───────────────────────────────────────────────── */}
      <Tabs.Screen
        name="my-pass"
        options={{
          title: 'My Pass',
          tabBarAccessibilityLabel: 'My Pass tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={Ticket} focused={focused} />,
        }}
      />

      {/* ── More ──────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarAccessibilityLabel: 'More options tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={MoreHorizontal} focused={focused} />,
        }}
      />

      {/* ── Scan (Volunteer / Member only) ────────────────────────── */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarAccessibilityLabel: 'QR scanner tab',
          tabBarIcon: ({ focused }) => <TabIcon Icon={QrCode} focused={focused} />,
          // Hide the tab unless the user has scanner feature flag.
          // Server enforces the role; this is display-only (spec §6.3).
          href: hasScanner ? '/scan' : null,
        }}
      />
    </Tabs>
  );
}
