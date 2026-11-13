import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BlockCard } from '@/components/today/BlockCard';
import { BlockSheet, type SheetTab } from '@/components/today/BlockSheet';
import { TodayHeader } from '@/components/today/TodayHeader';
import { TrackDrawer } from '@/components/today/TrackDrawer';
import { useFeedbacks } from '@/hooks/useFeedbacks';
import { useScoreSummary } from '@/hooks/useScoreSummary';
import { readStoredTrackId, storeTrackId, useTracks } from '@/hooks/useTracks';
import { useWeek } from '@/hooks/useWeek';
import { fullWeek, mondayOf, todayIso } from '@/lib/dates';
import { feedbackOn, type Block, type Track } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

function resolveTrack(tracks: Track[] | null, selectedId: string | null, boxId: string): Track | null {
  if (!tracks?.length) return null;
  const preferred = selectedId ?? readStoredTrackId(boxId);
  return tracks.find((t) => t.id === preferred) ?? tracks.find((t) => t.is_default) ?? tracks[0];
}

export default function TodayScreen() {
  const box = useActiveBox();
  const c = useBrand();
  const today = todayIso();
  const [day, setDay] = useState(today);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ block: Block; tab: SheetTab } | null>(null);

  const monday = mondayOf(day);
  const weekDays = useMemo(() => fullWeek(monday), [monday]);
  const { tracks } = useTracks(box.id);
  const track = resolveTrack(tracks, selectedTrackId, box.id);
  const trackId = track?.id ?? null;
  const { days: week, loading, error } = useWeek(box.id, monday, trackId);
  const blocks = useMemo(() => week?.find((d) => d.day === day)?.blocks ?? [], [week, day]);
  const level = box.my_level ?? 'RX';

  const scoreIds = useMemo(() => blocks.filter((b) => b.score_type).map((b) => b.id), [blocks]);
  const feedbackKinds = box.feedback_kinds;
  const feedbackIds = useMemo(
    () => blocks.filter((b) => feedbackOn(b, { feedback_kinds: feedbackKinds })).map((b) => b.id),
    [blocks, feedbackKinds],
  );
  const scores = useScoreSummary(scoreIds);
  const feedbacks = useFeedbacks(feedbackIds);

  const selectTrack = (t: Track) => {
    setSelectedTrackId(t.id);
    storeTrackId(box.id, t.id);
    setDrawerOpen(false);
  };

  const closeSheet = () => {
    setSheet(null);
    scores.reload();
    feedbacks.reload();
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <TodayHeader
        trackName={track?.name || 'Programmation'}
        days={weekDays}
        day={day}
        today={today}
        onDayChange={setDay}
        onOpenTracks={() => setDrawerOpen(true)}
      />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {!tracks || (loading && !week) ? (
          <ActivityIndicator color={c.primary} style={styles.spinner} />
        ) : error ? (
          <Text style={[styles.empty, { color: c.danger }]}>{error}</Text>
        ) : !blocks.length ? (
          <Text style={[styles.empty, { color: c.muted }]}>Pas de programmation publiée pour ce jour.</Text>
        ) : (
          blocks.map((b) => (
            <BlockCard
              key={b.id}
              block={b}
              level={level}
              kindColors={box.kind_colors}
              box={box}
              myScore={scores.mine.get(b.id)}
              scoreCount={scores.count.get(b.id) || 0}
              myFeedback={feedbacks.mine.get(b.id)}
              onOpen={(tab) => setSheet({ block: b, tab })}
            />
          ))
        )}
      </ScrollView>

      <TrackDrawer
        open={drawerOpen}
        tracks={tracks || []}
        selectedId={trackId}
        onSelect={selectTrack}
        onClose={() => setDrawerOpen(false)}
      />

      {sheet ? (
        <BlockSheet
          key={sheet.block.id + sheet.tab}
          block={sheet.block}
          initialTab={sheet.tab}
          myFeedback={feedbacks.mine.get(sheet.block.id)}
          memberLevel={level}
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
  body: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  spinner: {
    marginTop: 40,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    paddingHorizontal: 12,
  },
});
