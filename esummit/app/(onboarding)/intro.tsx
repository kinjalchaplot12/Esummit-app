/**
 * Intro slides — /intro
 * Shown once, on first launch (flag in src/lib/introFlag.ts, checked in app/_layout.tsx).
 * Three swipeable slides → Login.
 */

import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { CalendarDays, Ticket, Users, type LucideIcon } from 'lucide-react-native';
import { Button, Screen } from '../../src/components';
import { markIntroSeen } from '../../src/lib/introFlag';
import { colors, fontFamily, fontSize, screenPadding, spacing } from '../../src/theme';

interface Slide {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    key: 'events',
    icon: CalendarDays,
    title: 'Discover every event',
    subtitle: 'Browse talks, workshops and competitions across all three days, and never miss a session.',
  },
  {
    key: 'network',
    icon: Users,
    title: 'Meet founders & investors',
    subtitle: 'Connect with the people shaping the startup ecosystem, right on campus.',
  },
  {
    key: 'pass',
    icon: Ticket,
    title: 'Your pass, in your pocket',
    subtitle: 'Register in a tap and walk in with a digital pass. No printouts needed.',
  },
];

const DOT = 8;
const DOT_ACTIVE = 24;

export default function IntroScreen(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const finish = async () => {
    await markIntroSeen();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (isLast) finish();
    else listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.skipRow}>
        {!isLast ? <Button label="Skip" variant="text" size="sm" onPress={finish} /> : null}
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <SlideArt icon={item.icon} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots} accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}`}>
          {SLIDES.map((s, i) => (
            <Dot key={s.key} i={i} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Button label={isLast ? 'Get started' : 'Next'} onPress={next} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

/** Large icon inside three concentric purple circles. */
function SlideArt({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <View style={[styles.ring, styles.ringOuter]}>
      <View style={[styles.ring, styles.ringMiddle]}>
        <View style={[styles.ring, styles.ringInner]}>
          <Icon size={72} color={colors.onPrimary} strokeWidth={1.5} />
        </View>
      </View>
    </View>
  );
}

/** Stretches to DOT_ACTIVE and turns accent as its slide scrolls into view. */
function Dot({ i, scrollX, width }: { i: number; scrollX: SharedValue<number>; width: number }) {
  const style = useAnimatedStyle(() => {
    const range = [(i - 1) * width, i * width, (i + 1) * width];
    return {
      width: interpolate(scrollX.value, range, [DOT, DOT_ACTIVE, DOT], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(scrollX.value, range, [
        colors.cardBorder,
        colors.accent,
        colors.cardBorder,
      ]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  skipRow: {
    height: 52,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing['8'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['4'],
  },
  ring: { alignItems: 'center', justifyContent: 'center', borderRadius: 9999 },
  ringOuter: {
    width: 260,
    height: 260,
    backgroundColor: colors.primarySoft,
    marginBottom: spacing['8'],
  },
  ringMiddle: { width: 200, height: 200, backgroundColor: colors.accentSoft },
  ringInner: { width: 140, height: 140, backgroundColor: colors.primary },
  title: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['3xl'],
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: fontSize.base * 1.5,
  },
  footer: { paddingHorizontal: screenPadding, paddingBottom: spacing['4'], gap: spacing['6'] },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing['2'] },
  dot: { height: DOT, borderRadius: DOT / 2 },
});
