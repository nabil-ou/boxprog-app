import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

/** Timeline (ms) — charge → burst → badge. */
export const UNLOCK_CHARGE_MS = 950;
export const UNLOCK_BURST_MS = 480;
export const UNLOCK_BADGE_DELAY_MS = UNLOCK_CHARGE_MS + 80;
export const UNLOCK_COPY_DELAY_MS = UNLOCK_BADGE_DELAY_MS + 280;
export const UNLOCK_ACTIONS_DELAY_MS = UNLOCK_BADGE_DELAY_MS + 900;

const SIZE = 340;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RAY_COUNT = 14;

const AnimatedLine = Animated.createAnimatedComponent(Line);

/** Rayons qui convergent (charge) puis explosent (burst). */
function Ray({
  index,
  color,
  charge,
  burst,
}: {
  index: number;
  color: string;
  charge: SharedValue<number>;
  burst: SharedValue<number>;
}) {
  const angle = (index / RAY_COUNT) * Math.PI * 2 - Math.PI / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const animatedProps = useAnimatedProps(() => {
    const c = charge.value;
    const b = burst.value;

    // Charge : segment qui se rapproche du centre (de loin → près).
    if (b < 0.02) {
      const outer = interpolate(c, [0, 1], [150, 52]);
      const inner = interpolate(c, [0, 1], [118, 28]);
      return {
        x1: CX + cos * inner,
        y1: CY + sin * inner,
        x2: CX + cos * outer,
        y2: CY + sin * outer,
        opacity: interpolate(c, [0, 0.2, 1], [0, 0.55, 0.95]),
        strokeWidth: interpolate(c, [0, 1], [1.2, 2.8]),
      };
    }

    // Burst : rayon qui part vers l’extérieur puis fond.
    const inner = interpolate(b, [0, 1], [24, 70]);
    const outer = interpolate(b, [0, 1], [48, 155]);
    return {
      x1: CX + cos * inner,
      y1: CY + sin * inner,
      x2: CX + cos * outer,
      y2: CY + sin * outer,
      opacity: interpolate(b, [0, 0.15, 1], [1, 0.85, 0]),
      strokeWidth: interpolate(b, [0, 1], [3.2, 1]),
    };
  });

  return (
    <AnimatedLine
      animatedProps={animatedProps}
      stroke={color}
      strokeLinecap="round"
      x1={CX}
      y1={CY}
      x2={CX}
      y2={CY}
      strokeWidth={2}
    />
  );
}

/**
 * Séquence type Apple Achievement :
 * 1) charge (énergie qui converge)
 * 2) explosion lumineuse
 * 3) badge qui apparaît
 */
export function UnlockBurst({
  accent,
  light,
  children,
  onBurst,
}: {
  accent: string;
  light: string;
  children: React.ReactNode;
  /** Appelé au moment du flash (haptics). */
  onBurst?: () => void;
}) {
  const charge = useSharedValue(0);
  const burst = useSharedValue(0);
  const core = useSharedValue(0);
  const ringA = useSharedValue(0);
  const ringB = useSharedValue(0);
  const content = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    let burstTimer: ReturnType<typeof setTimeout> | undefined;

    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        charge.value = 1;
        burst.value = 1;
        core.value = 0;
        ringA.value = 1;
        ringB.value = 1;
        content.value = 1;
        spin.value = 0;
        onBurst?.();
        return;
      }

      charge.value = 0;
      burst.value = 0;
      core.value = 0;
      ringA.value = 0;
      ringB.value = 0;
      content.value = 0;
      spin.value = 0;

      // 1) Charge — rayons convergent, spin léger.
      charge.value = withTiming(1, { duration: UNLOCK_CHARGE_MS, easing: Easing.in(Easing.cubic) });
      spin.value = withTiming(1, { duration: UNLOCK_CHARGE_MS + UNLOCK_BURST_MS, easing: Easing.linear });

      // Cœur : charge → flash → fade.
      core.value = withSequence(
        withTiming(1, { duration: UNLOCK_CHARGE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.35, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) }),
      );

      // 2) Burst au pic de la charge.
      burst.value = withDelay(
        UNLOCK_CHARGE_MS,
        withTiming(1, { duration: UNLOCK_BURST_MS, easing: Easing.out(Easing.cubic) }),
      );
      ringA.value = withDelay(
        UNLOCK_CHARGE_MS,
        withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) }),
      );
      ringB.value = withDelay(
        UNLOCK_CHARGE_MS + 70,
        withTiming(1, { duration: 820, easing: Easing.out(Easing.cubic) }),
      );

      // 3) Badge après le flash.
      content.value = withDelay(
        UNLOCK_BADGE_DELAY_MS,
        withTiming(1, { duration: 680, easing: Easing.out(Easing.back(1.25)) }),
      );

      burstTimer = setTimeout(() => {
        if (!cancelled) onBurst?.();
      }, UNLOCK_CHARGE_MS);
    });

    return () => {
      cancelled = true;
      if (burstTimer) clearTimeout(burstTimer);
    };
  }, [burst, charge, content, core, onBurst, ringA, ringB, spin]);

  const coreStyle = useAnimatedStyle(() => {
    const c = core.value;
    const charging = burst.value < 0.02;
    if (charging) {
      return {
        opacity: interpolate(c, [0, 0.3, 1], [0, 0.45, 0.95]),
        transform: [{ scale: interpolate(c, [0, 1], [0.15, 0.92]) }],
      };
    }
    // Pendant le burst le core a déjà peakté via withSequence.
    return {
      opacity: interpolate(c, [0, 0.5, 1.35], [0, 0.7, 1]),
      transform: [{ scale: interpolate(c, [0, 1, 1.35], [0.2, 1, 2.4]) }],
    };
  });

  const ringAStyle = useAnimatedStyle(() => {
    const t = ringA.value;
    return {
      opacity: Math.max(0, 1 - t) * 0.95,
      transform: [{ scale: interpolate(t, [0, 1], [0.4, 2.35]) }],
    };
  });

  const ringBStyle = useAnimatedStyle(() => {
    const t = ringB.value;
    return {
      opacity: Math.max(0, 1 - t) * 0.55,
      transform: [{ scale: interpolate(t, [0, 1], [0.5, 2.7]) }],
    };
  });

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 28}deg` }],
  }));

  const haloStyle = useAnimatedStyle(() => {
    // Halo soft pendant la charge uniquement.
    const c = charge.value;
    const b = burst.value;
    return {
      opacity: b > 0.05 ? 0 : interpolate(c, [0, 1], [0, 0.35]),
      transform: [{ scale: interpolate(c, [0, 1], [0.6, 1.25]) }],
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [{ scale: interpolate(content.value, [0, 1], [0.35, 1]) }],
  }));

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.layer} pointerEvents="none">
        <Animated.View style={[styles.halo, { backgroundColor: accent }, haloStyle]} />
        <Animated.View
          style={[styles.blob, { backgroundColor: light, shadowColor: accent }, coreStyle]}
        />
        <Animated.View style={[styles.ring, { borderColor: accent }, ringAStyle]} />
        <Animated.View style={[styles.ring, { borderColor: light }, ringBStyle]} />
        <Animated.View style={[styles.rays, raysStyle]}>
          <Svg width={SIZE} height={SIZE}>
            {Array.from({ length: RAY_COUNT }, (_, i) => (
              <Ray key={i} index={i} color={accent} charge={charge} burst={burst} />
            ))}
          </Svg>
        </Animated.View>
      </View>
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 999,
  },
  blob: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    shadowOpacity: 0.9,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 999,
    borderWidth: 3,
  },
  rays: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
});
