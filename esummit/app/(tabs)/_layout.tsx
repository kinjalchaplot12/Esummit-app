/**
 * Bottom tab navigator — 5 fixed tabs: Home | Events | Map | Passes | Profile.
 * Rendered with the custom floating <TabBar />.
 * The volunteer scanner is a separate full-screen route (app/scanner.tsx),
 * reachable from Profile for users with scanner access.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components';
import { colors } from '../../src/theme';

export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home tab' }} />
      <Tabs.Screen
        name="events"
        options={{ title: 'Events', tabBarAccessibilityLabel: 'Events tab' }}
      />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarAccessibilityLabel: 'Map tab' }} />
      <Tabs.Screen
        name="passes"
        options={{ title: 'Passes', tabBarAccessibilityLabel: 'Passes tab' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarAccessibilityLabel: 'Profile tab' }}
      />
    </Tabs>
  );
}
