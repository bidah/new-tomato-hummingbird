import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { lines } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const palette = Object.values(lines).map((l) => l.color);

function Piece({ i }: { i: number }) {
  const p = useSharedValue(0);
  const cfg = useMemo(
    () => ({
      x: Math.random() * W,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 900,
      w: 6 + Math.random() * 8,
      h: i % 3 === 0 ? 6 + Math.random() * 6 : 14 + Math.random() * 10,
      round: i % 3 === 0,
      color: palette[i % palette.length],
      delay: Math.random() * 350,
      dur: 1500 + Math.random() * 900,
    }),
    [i],
  );
  useEffect(() => {
    p.value = withDelay(cfg.delay, withTiming(1, { duration: cfg.dur, easing: Easing.out(Easing.quad) }));
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: p.value < 0.85 ? 1 : (1 - p.value) / 0.15,
    transform: [
      { translateX: cfg.x + cfg.drift * p.value },
      { translateY: -40 + (H + 80) * p.value },
      { rotate: `${cfg.spin * p.value}deg` },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', width: cfg.w, height: cfg.h, backgroundColor: cfg.color, borderRadius: cfg.round ? cfg.w : 1 },
        style,
      ]}
    />
  );
}

export function Confetti() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 44 }, (_, i) => (
        <Piece key={i} i={i} />
      ))}
    </View>
  );
}
