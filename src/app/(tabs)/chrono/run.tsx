import { router, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useLayoutEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RunStage } from '@/components/chrono/RunStage';
import { useChronoRunner } from '@/hooks/useChronoRunner';
import { tabBarStyle } from '@/lib/tabBar';
import { useBrand } from '@/providers/BoxProvider';
import { useChronoConfig } from '@/providers/ChronoProvider';

export default function ChronoRunScreen() {
  const { cfg, patch, sessionName } = useChronoConfig();
  const runner = useChronoRunner(cfg);
  const navigation = useNavigation();
  const c = useBrand();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({ tabBarStyle: tabBarStyle(c, insets.bottom) });
    };
  }, [navigation, c, insets.bottom]);

  useEffect(() => {
    const ok = runner.begin();
    if (!ok) router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClose = () => {
    runner.reset();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chrono');
  };

  const onFinish = () => {
    if (runner.snap.mode === 'fort' || runner.snap.mode === 'up') {
      runner.finishBlock();
      return;
    }
    runner.finish();
  };

  return (
    <>
      <StatusBar style="light" />
      <RunStage
        snap={runner.snap}
        title={sessionName || 'Chrono'}
        voiceOn={cfg.voice}
        onToggleVoice={() => patch({ voice: !cfg.voice })}
        onClose={onClose}
        onTogglePause={runner.togglePause}
        onSkip={runner.skip}
        onReset={onClose}
        onFinish={onFinish}
        onLap={runner.lap}
        onAddRound={runner.addRound}
        onRemoveRound={runner.removeRound}
        onAddRep={runner.addRep}
      />
    </>
  );
}
