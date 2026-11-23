import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { sessionsLabel, type RankEntry } from '@/lib/bookingStats';
import { BorderRadius, FontSize, FontWeight, Spacing, font, mix, onColor } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const MEDALS = ['#D4A537', '#A7AFBA', '#B87333'] as const;
const SIZE = [76, 60, 60] as const;
const STEP = [70, 52, 40] as const;
/** Ordre d'affichage : 2e, 1er, 3e. */
const ORDER = [1, 0, 2] as const;

/** `top` : les trois premiers, dans l'ordre (null = place libre). */
export function RankPodium({ title, top }: { title: string; top: (RankEntry | null)[] }) {
  const c = useBrand();
  const line = mix(c.primary, c.onPrimary, 0.25);
  const empty = top.every((e) => !e);

  return (
    <View style={[styles.card, { backgroundColor: c.primary }]}>
      <Waves color={c.onPrimary} />
      <Text style={[styles.title, { color: c.onPrimary }]}>{title}</Text>
      {empty ? (
        <Text style={[styles.empty, { color: c.onPrimaryMuted }]}>Personne n’a encore de séance sur cette période.</Text>
      ) : (
        <View style={styles.row}>
          {ORDER.map((place) => {
            const entry = top[place] ?? null;
            const size = SIZE[place];
            const medal = MEDALS[place];
            return (
              <View key={place} style={styles.column}>
                {place === 0 ? <Rays color={medal} /> : null}
                <View style={styles.avatarWrap}>
                  {entry ? (
                    <View
                      style={[
                        styles.ring,
                        { borderColor: place === 0 ? medal : c.surface, borderRadius: (size + 6) / 2 },
                      ]}>
                      <Avatar name={entry.displayName} uri={entry.avatarUrl} size={size} />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.placeholder,
                        { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2, borderColor: line },
                      ]}
                    />
                  )}
                  <View style={[styles.medal, { backgroundColor: medal, borderColor: c.primary }]}>
                    <Text style={[styles.medalText, { color: onColor(medal) }]}>{entry ? entry.rank : place + 1}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.step,
                    { minHeight: STEP[place], borderTopColor: line },
                    place === 0 && [styles.stepTop, { borderLeftColor: line, borderRightColor: line }],
                  ]}>
                  <Text
                    style={[styles.name, { color: c.onPrimary, fontSize: place === 0 ? FontSize.S : FontSize.XS + 1 }]}
                    numberOfLines={1}>
                    {entry ? entry.displayName : '—'}
                    {entry?.isMe ? ' (toi)' : ''}
                  </Text>
                  {entry ? (
                    <Text style={[styles.sessions, { color: c.accent }]}>{sessionsLabel(entry.sessions)}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function Rays({ color }: { color: string }) {
  return (
    <Svg width={40} height={14} style={styles.rays}>
      <Line x1={8} y1={3} x2={12} y2={11} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={20} y1={1} x2={20} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={32} y1={3} x2={28} y2={11} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function Waves({ color }: { color: string }) {
  return (
    <Svg width={150} height={90} style={styles.waves} pointerEvents="none">
      {[0, 12, 24, 36].map((d) => (
        <Path
          key={d}
          d={`M${20 + d} 0 C ${50 + d} 30, ${90 + d} 10, ${150} ${40 + d}`}
          stroke={color}
          strokeOpacity={0.1}
          strokeWidth={1.5}
          fill="none"
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.XL,
    paddingTop: Spacing.M,
    paddingHorizontal: Spacing.M,
    overflow: 'hidden',
  },
  waves: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    paddingTop: Spacing.S,
    paddingBottom: Spacing.L,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: Spacing.S,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  rays: {
    marginBottom: 2,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: -Spacing.XS,
    zIndex: 1,
  },
  ring: {
    borderWidth: 3,
  },
  placeholder: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  medal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.BOLD,
  },
  step: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 2,
    paddingTop: Spacing.S + 2,
    paddingHorizontal: Spacing.XXS,
    paddingBottom: Spacing.S,
    borderTopWidth: 1,
  },
  stepTop: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: BorderRadius.S,
    borderTopRightRadius: BorderRadius.S,
  },
  name: {
    fontFamily: font.medium,
    fontWeight: FontWeight.MEDIUM,
  },
  sessions: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
});
