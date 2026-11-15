import { Audio, InterruptionModeAndroid, InterruptionModeIOS, type AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';

let audioReady = false;

async function ensureAudio() {
  if (audioReady) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
  });
  audioReady = true;
}

function toneWavBase64(freq: number, durationSec: number, volume = 0.4): string {
  const sampleRate = 22050;
  const n = Math.floor(sampleRate * durationSec);
  const dataSize = n * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const attack = Math.floor(sampleRate * 0.008);
  const release = Math.floor(sampleRate * 0.03);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let env = 1;
    if (i < attack) env = i / attack;
    else if (i > n - release) env = Math.max(0, (n - i) / release);
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * env;
    view.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, sample * 32767)), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

const SOURCES = {
  /** Last 3 seconds — short sharp tick */
  tick: { uri: `data:audio/wav;base64,${toneWavBase64(1100, 0.09, 0.45)}` } as AVPlaybackSource,
  /** GO / top départ — higher double-feel longer tone */
  go: { uri: `data:audio/wav;base64,${toneWavBase64(880, 0.22, 0.5)}` } as AVPlaybackSource,
  /** Fin de séance — lower longer tone */
  end: { uri: `data:audio/wav;base64,${toneWavBase64(420, 0.35, 0.55)}` } as AVPlaybackSource,
};

async function play(source: AVPlaybackSource) {
  await ensureAudio();
  const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume: 1 });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) void sound.unloadAsync();
  });
}

/** Countdown tick — each of the last 3 seconds. */
export async function beepTick() {
  try {
    await play(SOURCES.tick);
  } catch {
    /* ignore */
  }
}

/** Top départ / GO. */
export async function beepGo() {
  try {
    await play(SOURCES.go);
  } catch {
    /* ignore */
  }
}

/** Fin de chrono. */
export async function beepEnd() {
  try {
    await play(SOURCES.end);
  } catch {
    /* ignore */
  }
}

/** @deprecated use beepTick / beepGo / beepEnd */
export async function beep(_freq = 880) {
  return beepTick();
}

export function stopSpeech() {
  /* voice removed — no-op kept for call sites */
}

export async function buzz(enabled: boolean, pattern: 'short' | 'phase' | 'end' | 'tick' = 'short') {
  if (!enabled) return;
  try {
    if (pattern === 'end') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (pattern === 'phase') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (pattern === 'tick') {
      await Haptics.selectionAsync();
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* ignore */
  }
}
