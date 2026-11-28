import { Volume2, VolumeX, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { ProgressRing } from '@/components/chrono/ProgressRing';
import { chronoDark } from '@/lib/chrono/theme';
import type { RunSnapshot } from '@/lib/chrono/types';
import { MODE_NAMES } from '@/lib/chrono/types';
import { BorderRadius, FontSize, FontWeight, Height, Spacing, font, mix } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function RunStage({
  snap,
  title,
  voiceOn,
  onToggleVoice,
  onClose,
  onTogglePause,
  onSkip,
  onReset,
  onFinish,
  onLap,
  onAddRound,
  onRemoveRound,
  onAddRep,
}: {
  snap: RunSnapshot;
  title: string;
  voiceOn: boolean;
  onToggleVoice: () => void;
  onClose: () => void;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset: () => void;
  onFinish: () => void;
  onLap: () => void;
  onAddRound: () => void;
  onRemoveRound: () => void;
  onAddRep: (n: number) => void;
}) {
  const c = useBrand();
  const d = chronoDark(c);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const ringSize = Math.min(width - Spacing.M * 4, 280);

  const showAmrap = snap.mode === 'amrap' && (snap.phase === 'run' || snap.phase === 'pause');
  const showFort = (snap.mode === 'fort' || snap.mode === 'up') && snap.phase === 'run';
  const modeLabel = MODE_NAMES[snap.mode] || snap.top;
  const paused = snap.phase === 'pause';

  return (
    <Pressable
      // Keep child buttons individually reachable by VoiceOver.
      accessible={false}
      disabled={snap.phase === 'done'}
      onPress={onTogglePause}
      style={[
        styles.root,
        {
          backgroundColor: d.bg,
          paddingTop: insets.top + Spacing.S,
          paddingBottom: Math.max(insets.bottom, Spacing.M),
        },
      ]}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Fermer"
          onPress={onClose}
          hitSlop={10}
          style={[styles.iconBtn, { borderColor: d.border, backgroundColor: d.card }]}>
          <X size={20} color={d.text} strokeWidth={APP_ICON_STROKE} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: d.text }]} numberOfLines={1}>
          {title || 'Chrono'}
        </Text>
        <Pressable
          accessibilityLabel={voiceOn ? 'Couper les sons' : 'Activer les sons'}
          onPress={onToggleVoice}
          hitSlop={10}
          style={[styles.iconBtn, { borderColor: d.border, backgroundColor: d.card }]}>
          {voiceOn ? (
            <Volume2 size={20} color={d.accent} strokeWidth={APP_ICON_STROKE} />
          ) : (
            <VolumeX size={20} color={d.muted} strokeWidth={APP_ICON_STROKE} />
          )}
        </Pressable>
      </View>

      <Text style={[styles.eyebrow, { color: d.accent }]}>{modeLabel}</Text>
      {snap.blockTotal > 1 ? (
        <Text style={[styles.blockIdx, { color: d.muted }]}>
          BLOC {snap.blockIndex} / {snap.blockTotal}
        </Text>
      ) : null}

      <View style={styles.ringWrap}>
        <ProgressRing
          progress={snap.bar}
          size={ringSize}
          trackColor={mix(d.text, d.bg, 0.82)}
          fillColor={snap.displayPhase === 'rest' ? '#5B8DEF' : d.accent}
          time={snap.big}
          phase={snap.phaseLabel || snap.sub}
          timeColor={d.text}
          phaseColor={d.muted}
        />
      </View>

      <View style={styles.meta}>
        {snap.tourTotal > 0 ? (
          <Text style={[styles.metaTxt, { color: d.text }]}>
            TOUR {snap.tour} / {snap.tourTotal}
          </Text>
        ) : showFort && snap.tour > 0 ? (
          <Text style={[styles.metaTxt, { color: d.text }]}>TOUR {snap.tour}</Text>
        ) : showAmrap ? (
          <Text style={[styles.metaTxt, { color: d.text }]}>
            {snap.rounds} round{snap.rounds !== 1 ? 's' : ''}
            {snap.reps ? ` · ${snap.reps} rep${snap.reps !== 1 ? 's' : ''}` : ''}
          </Text>
        ) : (
          <Text style={[styles.metaTxt, { color: d.muted }]}> </Text>
        )}
        <Text style={[styles.elapsed, { color: d.muted }]}>{snap.elapsed}</Text>
      </View>

      <View style={[styles.barTrack, { backgroundColor: mix(d.text, d.bg, 0.85) }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(100, snap.bar * 100)}%`,
              backgroundColor: d.accent,
            },
          ]}
        />
      </View>

      {snap.nextLabel && snap.phase !== 'done' ? (
        <View style={[styles.next, { backgroundColor: d.card, borderColor: d.border }]}>
          <Text style={[styles.nextEyebrow, { color: d.muted }]}>ENSUITE</Text>
          <Text style={[styles.nextLabel, { color: d.text }]}>{snap.nextLabel}</Text>
        </View>
      ) : null}

      {snap.phase === 'done' && snap.resultLines.length ? (
        <ScrollView style={styles.res} contentContainerStyle={{ gap: 4 }}>
          {snap.resultLines.map((line, i) => (
            <Text key={i} style={[styles.resLine, { color: d.text }]}>
              {line}
            </Text>
          ))}
        </ScrollView>
      ) : null}

      {showAmrap ? (
        <View style={styles.amrap}>
          <View style={styles.mid}>
            <Pressable
              onPress={onRemoveRound}
              style={[styles.smallBtn, { backgroundColor: d.card, borderColor: d.border }]}>
              <Text style={[styles.smallBtnTxt, { color: d.text }]}>−</Text>
            </Pressable>
            <Pressable
              onPress={onAddRound}
              style={[styles.roundBtn, { backgroundColor: d.raised, borderColor: d.border }]}>
              <Text style={[styles.roundBtnTxt, { color: d.text }]}>+1 round</Text>
            </Pressable>
          </View>
          <View style={styles.mid}>
            <Pressable
              onPress={() => onAddRep(-1)}
              style={[styles.smallBtn, { backgroundColor: d.card, borderColor: d.border }]}>
              <Text style={[styles.smallBtnTxt, { color: d.text }]}>−</Text>
            </Pressable>
            <Pressable
              onPress={() => onAddRep(1)}
              style={[styles.chip, { backgroundColor: d.card, borderColor: d.border }]}>
              <Text style={[styles.chipTxt, { color: d.text }]}>+1</Text>
            </Pressable>
            <Pressable
              onPress={() => onAddRep(5)}
              style={[styles.chip, { backgroundColor: d.card, borderColor: d.border }]}>
              <Text style={[styles.chipTxt, { color: d.text }]}>+5</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.ctr}>
        {snap.phase === 'cd' ? (
          <Pressable
            onPress={onSkip}
            style={[styles.outlineBtn, { borderColor: d.border, flex: 1 }]}>
            <Text style={[styles.outlineTxt, { color: d.text }]}>Passer</Text>
          </Pressable>
        ) : null}

        {snap.phase === 'done' ? (
          <Pressable
            onPress={onReset}
            style={[styles.mainBtn, { backgroundColor: d.accent, flex: 1 }]}>
            <Text style={[styles.mainBtnTxt, { color: d.onAccent }]}>Fermer</Text>
          </Pressable>
        ) : (
          <>
            {showFort ? (
              <Pressable
                onPress={onLap}
                style={[styles.outlineBtn, { borderColor: d.border }]}>
                <Text style={[styles.outlineTxt, { color: d.text }]}>Tour</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onTogglePause}
              style={[styles.mainBtn, { backgroundColor: d.accent, flex: 1 }]}>
              <Text style={[styles.mainBtnTxt, { color: d.onAccent }]}>
                {paused ? 'Reprendre' : 'Pause'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onFinish}
              style={[styles.outlineBtn, { borderColor: d.border, flex: 1 }]}>
              <Text style={[styles.outlineTxt, { color: d.text }]}>Terminer</Text>
            </Pressable>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.M,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.S,
    marginBottom: Spacing.S,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  eyebrow: {
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  blockIdx: {
    textAlign: 'center',
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    marginTop: 2,
    letterSpacing: 0.6,
  },
  ringWrap: {
    alignItems: 'center',
    marginVertical: Spacing.L,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.XS,
  },
  metaTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 0.8,
  },
  elapsed: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: FontSize.L,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.M,
  },
  barFill: { height: '100%' },
  next: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    padding: Spacing.S,
    marginBottom: Spacing.S,
    gap: 2,
  },
  nextEyebrow: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS,
    letterSpacing: 1,
  },
  nextLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  res: { maxHeight: '18%', marginBottom: Spacing.XS },
  resLine: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  amrap: { gap: Spacing.XS, marginBottom: Spacing.S },
  mid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
  },
  smallBtn: {
    width: Height.PRESSABLE_S,
    height: Height.PRESSABLE_S,
    borderRadius: BorderRadius.S,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
  },
  roundBtn: {
    flex: 1,
    minHeight: Height.PRESSABLE_S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
  },
  chip: {
    flex: 1,
    minHeight: Height.PRESSABLE_S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
  },
  ctr: {
    flexDirection: 'row',
    gap: Spacing.XS,
    marginTop: 'auto' as unknown as number,
  },
  mainBtn: {
    minHeight: Height.PRESSABLE_S + 4,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.M,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  outlineBtn: {
    minHeight: Height.PRESSABLE_S + 4,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
});
