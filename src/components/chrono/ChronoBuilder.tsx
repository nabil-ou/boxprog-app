import * as Haptics from 'expo-haptics';
import {
  Check,
  ChevronRight,
  ChevronUp,
  Pencil,
  Play,
  Plus,
  Star,
  Timer,
  Volume2,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { Stepper } from '@/components/chrono/Stepper';
import { MIX_BLOCK_META, mixTotalSeconds } from '@/lib/chrono/defaults';
import { durationStep, fmt, intervalStep } from '@/lib/chrono/format';
import type { ChronoConfig, MixBlock } from '@/lib/chrono/types';
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Height,
  Spacing,
  font,
  softShadow,
  type Palette,
} from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

function blockDurationLabel(b: MixBlock): string {
  if (b.m === 'amrap') return `${b.v} min`;
  if (b.m === 'fort') return b.v ? `${b.v} min` : 'Sans cap';
  if (b.m === 'emom') return `${Math.round((b.v * (b.iv || 60)) / 60)} min`;
  if (b.m === 'tabata' || b.m === 'int') {
    const w = b.iv || (b.m === 'tabata' ? 20 : 40);
    const rs = b.rs ?? (b.m === 'tabata' ? 10 : 20);
    const n = b.v || 8;
    return fmt((w + rs) * n - rs);
  }
  if (b.m === 'up') return 'Ouvert';
  if (b.m === 'rest') return fmt(b.v);
  return '';
}

function fieldValue(b: MixBlock, field: 'v' | 'iv' | 'rs'): string {
  if (field === 'iv') {
    if (b.m === 'emom') return fmt(b.iv || 60);
    return fmt(b.iv || (b.m === 'tabata' ? 20 : 40));
  }
  if (field === 'rs') return fmt(b.rs ?? (b.m === 'tabata' ? 10 : 20));
  if (b.m === 'rest') return fmt(b.v);
  if (b.m === 'amrap' || b.m === 'fort') return b.v === 0 && b.m === 'fort' ? 'Aucun' : `${b.v} min`;
  return String(b.v);
}

const ADDABLE: MixBlock['m'][] = ['amrap', 'fort', 'emom', 'tabata', 'int', 'up', 'rest'];

export function ChronoBuilder({
  cfg,
  sessionName,
  onSessionName,
  onChange,
  onMix,
  onStart,
  isFavorite,
  isDirty,
  onSaveFavorite,
  onSaveAsNew,
}: {
  cfg: ChronoConfig;
  sessionName: string;
  onSessionName: (name: string) => void;
  onChange: (partial: Partial<ChronoConfig>) => void;
  onMix: (mix: MixBlock[]) => void;
  onStart: () => void;
  isFavorite: boolean;
  /** Unsaved changes on the open favorite */
  isDirty: boolean;
  onSaveFavorite: () => void;
  onSaveAsNew: () => void;
}) {
  const c = useBrand();
  const [expanded, setExpanded] = useState<number | null>(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cdOpen, setCdOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  const confirmSaved = (save: () => void) => {
    save();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setJustSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setJustSaved(false), 1600);
  };

  const mix = cfg.mix;
  const total = mixTotalSeconds(mix);
  const workCount = mix.filter((b) => b.m !== 'rest').length;
  const summary =
    mix.length === 0
      ? 'Aucun bloc'
      : `${mix.length} bloc${mix.length > 1 ? 's' : ''}${total > 0 ? ` • ${fmt(total)}` : ''}`;
  const ctaLabel = total > 0 ? `Démarrer • ${fmt(total)}` : 'Démarrer';

  const bump = (i: number, field: 'v' | 'iv' | 'rs', dir: number) => {
    const next = mix.map((b) => ({ ...b }));
    const b = next[i];
    const meta = MIX_BLOCK_META[b.m];
    if (field === 'iv') {
      const v = b.iv || (b.m === 'emom' ? 60 : b.m === 'tabata' ? 20 : 40);
      const ref = dir > 0 ? v : v - 1;
      const sp = b.m === 'emom' ? intervalStep(ref, dir) : durationStep(ref);
      b.iv = Math.min(600, Math.max(5, v + sp * dir));
    } else if (field === 'rs') {
      const v = b.rs ?? (b.m === 'tabata' ? 10 : 20);
      const ref = dir > 0 ? v : v - 1;
      b.rs = Math.min(600, Math.max(0, v + durationStep(ref) * dir));
    } else if (!meta.fixed) {
      const ref = dir > 0 ? b.v : b.v - 1;
      const sp = b.m === 'rest' ? (ref < 120 ? 15 : 30) : 1;
      b.v = Math.min(meta.max, Math.max(meta.min, b.v + sp * dir));
    }
    onMix(next);
  };

  const addBlock = (kind: MixBlock['m']) => {
    const meta = MIX_BLOCK_META[kind];
    const block: MixBlock = { m: kind, v: meta.v };
    if (kind === 'emom') block.iv = 60;
    if (kind === 'tabata') {
      block.iv = 20;
      block.rs = 10;
    }
    if (kind === 'int') {
      block.iv = 40;
      block.rs = 20;
    }
    const next = [...mix, block];
    onMix(next);
    setExpanded(next.length - 1);
    setPickerOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.muted }]}>Nom du chrono</Text>
      <TextInput
        value={sessionName}
        onChangeText={onSessionName}
        placeholder="Force + conditioning"
        placeholderTextColor={c.muted}
        maxLength={40}
        style={[
          styles.name,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            color: c.text,
          },
        ]}
      />

      <View style={styles.summaryRow}>
        <Text style={[styles.summary, { color: c.muted }]}>{summary}</Text>
        {workCount > 0 ? (
          <Text style={[styles.summaryHint, { color: c.muted }]}>
            {workCount} effort{workCount > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>

      <View style={styles.blocks}>
        {mix.map((b, i) => {
          const meta = MIX_BLOCK_META[b.m];
          const open = expanded === i;
          const badge = String(i + 1).padStart(2, '0');
          return (
            <View
              key={`${b.m}-${i}`}
              style={[styles.block, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.blockHead}>
                <View style={[styles.num, { backgroundColor: c.accent }]}>
                  <Text style={[styles.numTxt, { color: c.onAccent }]}>{badge}</Text>
                </View>
                <View style={styles.blockMeta}>
                  <Text style={[styles.blockType, { color: c.text }]}>{meta.n}</Text>
                  <Text style={[styles.blockDur, { color: c.muted }]}>{blockDurationLabel(b)}</Text>
                </View>
                <Pressable
                  accessibilityLabel={open ? 'Replier' : 'Éditer'}
                  hitSlop={8}
                  onPress={() => setExpanded(open ? null : i)}
                  style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.raised }]}>
                  {open ? (
                    <ChevronUp size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
                  ) : (
                    <Pencil size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
                  )}
                </Pressable>
                <Pressable
                  accessibilityLabel="Supprimer"
                  hitSlop={8}
                  onPress={() => {
                    onMix(mix.filter((_, j) => j !== i));
                    setExpanded(null);
                  }}
                  style={[styles.iconBtn, { borderColor: c.border, backgroundColor: c.raised }]}>
                  <X size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
                </Pressable>
              </View>

              {open && b.m !== 'up' ? (
                <View style={[styles.fields, { borderTopColor: c.border }]}>
                  {(b.m === 'amrap' || b.m === 'fort') && (
                    <FieldRow
                      label={b.m === 'fort' ? 'Time cap' : 'Durée'}
                      palette={c}
                      value={fieldValue(b, 'v')}
                      onMinus={() => bump(i, 'v', -1)}
                      onPlus={() => bump(i, 'v', 1)}
                    />
                  )}
                  {b.m === 'emom' && (
                    <>
                      <FieldRow
                        label="Intervalle"
                        palette={c}
                        value={fieldValue(b, 'iv')}
                        onMinus={() => bump(i, 'iv', -1)}
                        onPlus={() => bump(i, 'iv', 1)}
                      />
                      <FieldRow
                        label="Tours"
                        palette={c}
                        value={fieldValue(b, 'v')}
                        onMinus={() => bump(i, 'v', -1)}
                        onPlus={() => bump(i, 'v', 1)}
                      />
                    </>
                  )}
                  {(b.m === 'tabata' || b.m === 'int') && (
                    <>
                      <FieldRow
                        label="Travail"
                        palette={c}
                        value={fieldValue(b, 'iv')}
                        onMinus={() => bump(i, 'iv', -1)}
                        onPlus={() => bump(i, 'iv', 1)}
                      />
                      <FieldRow
                        label="Repos"
                        palette={c}
                        value={fieldValue(b, 'rs')}
                        onMinus={() => bump(i, 'rs', -1)}
                        onPlus={() => bump(i, 'rs', 1)}
                      />
                      <FieldRow
                        label="Tours"
                        palette={c}
                        value={fieldValue(b, 'v')}
                        onMinus={() => bump(i, 'v', -1)}
                        onPlus={() => bump(i, 'v', 1)}
                      />
                    </>
                  )}
                  {b.m === 'rest' && (
                    <FieldRow
                      label="Durée"
                      palette={c}
                      value={fieldValue(b, 'v')}
                      onMinus={() => bump(i, 'v', -1)}
                      onPlus={() => bump(i, 'v', 1)}
                    />
                  )}
                </View>
              ) : null}

              {open && b.m === 'up' ? (
                <View style={[styles.fields, { borderTopColor: c.border }]}>
                  <Text style={[styles.hint, { color: c.muted }]}>
                    Chrono libre sans limite — appuie sur Terminer pour l’arrêter.
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {pickerOpen ? (
          <View style={[styles.picker, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
            {ADDABLE.map((k) => (
              <Pressable
                key={k}
                onPress={() => addBlock(k)}
                style={({ pressed }) => [
                  styles.pickerItem,
                  { borderBottomColor: c.border, opacity: pressed ? 0.75 : 1 },
                ]}>
                <Text style={[styles.pickerTxt, { color: c.text }]}>+ {MIX_BLOCK_META[k].n}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={({ pressed }) => [
              styles.addDashed,
              {
                borderColor: c.border,
                backgroundColor: c.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Plus size={18} color={c.accent} strokeWidth={APP_ICON_STROKE} />
            <Text style={[styles.addTxt, { color: c.accent }]}>Ajouter un bloc</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.settings, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Pressable
          onPress={() => setCdOpen((v) => !v)}
          style={[styles.setRow, { borderBottomColor: c.border }]}>
          <Timer size={18} color={c.muted} strokeWidth={APP_ICON_STROKE} />
          <Text style={[styles.setLabel, { color: c.text }]}>Départ différé</Text>
          <Text style={[styles.setValue, { color: c.muted }]}>
            {cfg.cd === 0 ? 'Off' : `${cfg.cd} s`}
          </Text>
          {cdOpen ? (
            <ChevronUp size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
          ) : (
            <ChevronRight size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
          )}
        </Pressable>
        {cdOpen ? (
          <View style={[styles.cdPad, { borderBottomColor: c.border }]}>
            <Stepper
              value={cfg.cd === 0 ? 'Off' : `${cfg.cd} s`}
              onMinus={() => onChange({ cd: Math.max(0, cfg.cd - 5) })}
              onPlus={() => onChange({ cd: Math.min(60, cfg.cd + 5) })}
            />
          </View>
        ) : null}
        <View style={styles.setRow}>
          <Volume2 size={18} color={c.muted} strokeWidth={APP_ICON_STROKE} />
          <Text style={[styles.setLabel, { color: c.text }]}>Sons</Text>
          <Switch
            value={cfg.voice}
            onValueChange={(v) => onChange({ voice: v })}
            trackColor={{ false: c.border, true: c.accent }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!mix.length}
        onPress={onStart}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: c.accent,
            opacity: !mix.length ? 0.4 : pressed ? 0.88 : 1,
          },
        ]}>
        <Play size={16} color={c.onAccent} strokeWidth={APP_ICON_STROKE} fill={c.onAccent} />
        <Text style={[styles.ctaTxt, { color: c.onAccent }]}>{ctaLabel}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!mix.length}
        onPress={() => confirmSaved(onSaveFavorite)}
        style={({ pressed }) => [
          styles.favBtn,
          {
            borderColor: c.border,
            backgroundColor: c.surface,
            opacity: !mix.length ? 0.4 : pressed ? 0.8 : 1,
          },
        ]}>
        {justSaved ? (
          <Check size={16} color={c.accent} strokeWidth={APP_ICON_STROKE} />
        ) : (
          <Star
            size={16}
            color={c.accent}
            strokeWidth={APP_ICON_STROKE}
            fill={isFavorite ? c.accent : 'transparent'}
          />
        )}
        <Text style={[styles.favTxt, { color: c.text }]}>
          {justSaved ? 'Enregistré' : isFavorite ? 'Mettre à jour le favori' : 'Enregistrer en favori'}
        </Text>
      </Pressable>

      {isFavorite && isDirty && mix.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => confirmSaved(onSaveAsNew)}
          style={({ pressed }) => [styles.saveAsNew, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.saveAsNewTxt, { color: c.muted }]}>Enregistrer comme nouveau</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FieldRow({
  label,
  value,
  onMinus,
  onPlus,
  palette,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  palette: Palette;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: palette.muted }]}>{label}</Text>
      <Stepper value={value} onMinus={onMinus} onPlus={onPlus} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.S, flex: 1 },
  label: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    marginBottom: -4,
  },
  name: {
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.S,
    fontFamily: font.regular,
    fontSize: FontSize.S,
    minHeight: Height.INPUT_S,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  summaryHint: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  blocks: { gap: Spacing.XS },
  block: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
    padding: Spacing.S,
  },
  num: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  blockMeta: { flex: 1, gap: 2 },
  blockType: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  blockDur: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.S,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.S,
    gap: Spacing.XS,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.S,
  },
  fieldLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    flexShrink: 1,
  },
  hint: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    lineHeight: 18,
  },
  addDashed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.XXS,
    minHeight: Height.PRESSABLE_S + 8,
    borderRadius: BorderRadius.M,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  picker: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.M,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
  },
  settings: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    overflow: 'hidden',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.S,
    minHeight: Height.PRESSABLE_S + 8,
  },
  setLabel: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  setValue: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  cdPad: {
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-end',
  },
  cta: {
    marginTop: Spacing.XS,
    minHeight: Height.PRESSABLE_M,
    borderRadius: BorderRadius.L,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.XS,
  },
  ctaTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  favBtn: {
    minHeight: Height.PRESSABLE_M,
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.XS,
  },
  favTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  saveAsNew: {
    alignSelf: 'center',
    paddingVertical: Spacing.XXS,
  },
  saveAsNewTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    textDecorationLine: 'underline',
  },
});
