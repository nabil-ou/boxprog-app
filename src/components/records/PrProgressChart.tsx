import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { formatPrValue, type PrEntry, type PrUnit } from '@/lib/records';
import { BorderRadius, FontSize, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const PAD = { top: 16, right: 16, bottom: 8, left: 56 };
const CHART_H = 160;

export function PrProgressChart({
  entries,
  unit,
}: {
  entries: PrEntry[];
  unit: PrUnit;
}) {
  const c = useBrand();
  const { width: winW } = useWindowDimensions();
  const width = winW - Spacing.M * 2;

  const chronological = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)),
    [entries],
  );

  const model = useMemo(() => {
    const plotW = width - PAD.left - PAD.right;
    const plotH = CHART_H - PAD.top - PAD.bottom;
    if (!chronological.length) return null;

    const vals = chronological.map((e) => e.value);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const span = Math.max(1, maxV - minV);
    const pad = Math.max(span * 0.2, unit === 'kg' ? 5 : 1);
    const yMin = minV - pad;
    const yMax = maxV + pad;
    const ySpan = yMax - yMin;

    const mid = Math.round((minV + maxV) / 2);
    const yTicks = [maxV, mid, minV].filter((v, i, a) => a.indexOf(v) === i);

    const points = chronological.map((entry, i) => {
      const x =
        PAD.left +
        (chronological.length === 1 ? plotW / 2 : (i / (chronological.length - 1)) * plotW);
      const y = PAD.top + plotH - ((entry.value - yMin) / ySpan) * plotH;
      return { x, y, entry };
    });

    const xLabels = chronological.map((e) => {
      const d = new Date(`${e.date}T12:00:00`);
      const raw = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    });

    return {
      points,
      yTicks,
      xLabels,
      linePoints: points.map((p) => `${p.x},${p.y}`).join(' '),
      yMin,
      ySpan,
      plotH,
    };
  }, [chronological, width, unit]);

  if (!model) {
    return (
      <View style={[styles.empty, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.emptyTxt, { color: c.muted }]}>Pas encore de progression</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View>
        <Svg width={width} height={CHART_H}>
          {model.yTicks.map((tick) => {
            const y = PAD.top + model.plotH - ((tick - model.yMin) / model.ySpan) * model.plotH;
            return (
              <Line
                key={tick}
                x1={PAD.left}
                y1={y}
                x2={width - PAD.right}
                y2={y}
                stroke={c.border}
                strokeWidth={StyleSheet.hairlineWidth * 2}
              />
            );
          })}
          <Polyline
            points={model.linePoints}
            fill="none"
            stroke={c.accent}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {model.points.map((p) => (
            <Circle
              key={p.entry.id}
              cx={p.x}
              cy={p.y}
              r={5}
              fill={c.surface}
              stroke={c.accent}
              strokeWidth={2.5}
            />
          ))}
        </Svg>
        {model.yTicks.map((tick) => {
          const y = PAD.top + model.plotH - ((tick - model.yMin) / model.ySpan) * model.plotH;
          return (
            <Text key={`yl-${tick}`} style={[styles.yLabel, { color: c.muted, top: y - 7 }]}>
              {formatPrValue(tick, unit)}
            </Text>
          );
        })}
      </View>
      <View style={[styles.xRow, { paddingLeft: PAD.left, paddingRight: PAD.right }]}>
        {model.xLabels.map((label, i) => (
          <Text
            key={`${label}-${i}`}
            style={[
              styles.xLabel,
              {
                color: c.muted,
                textAlign:
                  i === 0 ? 'left' : i === model.xLabels.length - 1 ? 'right' : 'center',
              },
            ]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: Spacing.S,
  },
  empty: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.M,
  },
  emptyTxt: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
  yLabel: {
    position: 'absolute',
    left: 8,
    width: PAD.left - 12,
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
    fontVariant: ['tabular-nums'],
  },
  xRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  xLabel: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
});
