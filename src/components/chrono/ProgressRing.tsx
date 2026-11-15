import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { FontSize, FontWeight, font } from '@/lib/theme';

const DIGIT = 'BarlowCondensed_700Bold';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  progress,
  size,
  stroke = 10,
  trackColor,
  fillColor,
  time,
  phase,
  timeColor,
  phaseColor,
}: {
  progress: number;
  size: number;
  stroke?: number;
  trackColor: string;
  fillColor: string;
  time: string;
  phase: string;
  timeColor: string;
  phaseColor: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const target = Math.max(0, Math.min(1, progress));
  const p = useSharedValue(target);

  useEffect(() => {
    const prev = p.get();
    // Snap on phase reset / big jump so the ring never rewinds slowly.
    if (Math.abs(target - prev) > 0.15) {
      p.set(target);
      return;
    }
    p.set(
      withTiming(target, {
        duration: 50,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [target, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - p.get()),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          stroke={fillColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx}, ${cy}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={[styles.time, { color: timeColor, fontSize: size * 0.22 }]}>{time}</Text>
      {phase ? <Text style={[styles.phase, { color: phaseColor }]}>{phase}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  time: {
    fontFamily: DIGIT,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  phase: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
