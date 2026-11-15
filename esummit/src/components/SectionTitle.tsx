/**
 * SectionTitle — heading row for a content section, with an optional
 * "See all" style action on the right.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, fontFamily, fontSize, minTouchTarget, spacing } from '../theme';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: SectionTitleProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.texts}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}: ${title}`}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  texts: { flex: 1 },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: minTouchTarget,
    paddingLeft: spacing['3'],
  },
  actionLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
