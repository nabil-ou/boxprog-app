import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppDrawer } from '@/components/AppDrawer';
import { BlockCard } from '@/components/today/BlockCard';
import { BlockSheet } from '@/components/today/BlockSheet';
import { LevelChips } from '@/components/today/LevelChips';
import { TodayHeader } from '@/components/today/TodayHeader';
import { useFeedbacks } from '@/hooks/useFeedbacks';
import { useScoreSummary } from '@/hooks/useScoreSummary';
import { readStoredTrackId, storeTrackId, useTracks } from '@/hooks/useTracks';
import { useWeek } from '@/hooks/useWeek';
import { mondayOf, todayIso } from '@/lib/dates';
import { Spacing, textStyles } from '@/lib/theme';
import { boxLevel, feedbackOn, type Block, type Level, type Track } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

function resolveTrack(tracks: Track[] | null, selectedId: string | null, boxId: string): Track | null {
  if (!tracks?.length) return null;
  const chosen = selectedId ? tracks.find((t) => t.id === selectedId) : undefined;
  if (chosen) return chosen;
  const personal = tracks.find((t) => t.member_id);
  if (personal) return personal;
  const stored = readStoredTrackId(boxId);
  return tracks.find((t) => t.id === stored) ?? tracks.find((t) => t.is_default) ?? tracks[0];
}

export default function WodScreen() {
  const { session } = useAuth();
  const box = useActiveBox();
  const c = useBrand();
  const t = textStyles(c);
  const today = todayIso();
  const [day, setDay] = useState(today);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [sheetBlock, setSheetBlock] = useState<Block | null>(null);
  const [displayLevel, setDisplayLevel] = useState<Level>(boxLevel(box, box.my_level));
  const { my_level: myLevel, elite_level: eliteLevel } = box;

  const monday = mondayOf(day);
  const { tracks } = useTracks(box.id, session?.user.id);
  const track = resolveTrack(tracks, selectedTrackId, box.id);
  const trackId = track?.id ?? null;
  const { days: week, loading, error } = useWeek(box.id, monday, trackId);
  const blocks = useMemo(() => week?.find((d) => d.day === day)?.blocks ?? [], [week, day]);

  useEffect(() => {
    setDisplayLevel(boxLevel({ elite_level: eliteLevel }, myLevel));
  }, [myLevel, eliteLevel]);

  const scoreIds = useMemo(() => blocks.filter((b) => b.score_type).map((b) => b.id), [blocks]);
  const feedbackKinds = box.feedback_kinds;
  const feedbackIds = useMemo(
    () => blocks.filter((b) => feedbackOn(b, { feedback_kinds: feedbackKinds })).map((b) => b.id),
    [blocks, feedbackKinds],
  );
  const scores = useScoreSummary(scoreIds);
  const feedbacks = useFeedbacks(feedbackIds);

  const selectTrack = (next: Track) => {
    setSelectedTrackId(next.id);
    storeTrackId(box.id, next.id);
    setDrawerOpen(false);
  };

  const closeSheet = () => {
    setSheetBlock(null);
    scores.reload();
    feedbacks.reload();
  };

  const showLevelChips = !!tracks && !error && !(loading && !week);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <TodayHeader
        trackName={track?.name || 'Programmation'}
        day={day}
        today={today}
        onDayChange={setDay}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      {showLevelChips ? (
        <View style={[styles.levelBar, { backgroundColor: c.background }]}>
          <LevelChips value={displayLevel} onChange={setDisplayLevel} />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {!tracks || (loading && !week) ? (
          <ActivityIndicator color={c.primary} style={styles.spinner} />
        ) : error ? (
          <Text style={[t.body, styles.empty, { color: c.danger }]}>{error}</Text>
        ) : !blocks.length ? (
          <Text style={[t.body, styles.empty]}>Pas de programmation publiée pour ce jour.</Text>
        ) : (
          blocks.map((b) => (
            <BlockCard
              key={b.id}
              block={b}
              level={displayLevel}
              kindColors={box.kind_colors}
              box={box}
              myScore={scores.mine.get(b.id)}
              scoreCount={scores.count.get(b.id) || 0}
              myFeedback={feedbacks.mine.get(b.id)}
              onNote={() => setSheetBlock(b)}
              onScores={() => router.push(`/scores/${b.id}`)}
            />
          ))
        )}
      </ScrollView>

      <AppDrawer
        open={drawerOpen}
        tracks={tracks || []}
        selectedId={trackId}
        onSelectTrack={selectTrack}
        onClose={() => setDrawerOpen(false)}
      />

      {sheetBlock ? (
        <BlockSheet
          key={sheetBlock.id}
          block={sheetBlock}
          myFeedback={feedbacks.mine.get(sheetBlock.id)}
          memberLevel={displayLevel}
          onClose={closeSheet}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  levelBar: {
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.S,
    paddingBottom: Spacing.XS,
  },
  body: {
    padding: Spacing.M,
    gap: Spacing.S,
    paddingBottom: Spacing.XL,
  },
  spinner: {
    marginTop: Spacing.XXL,
  },
  empty: {
    marginTop: Spacing.XL,
    textAlign: 'center',
    paddingHorizontal: Spacing.S,
  },
});
