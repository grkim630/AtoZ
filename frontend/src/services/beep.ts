/**
 * Simple start/end "beep" without bundling binary assets.
 * Generates a short PCM WAV (sine wave), writes to cache, then plays it with expo-av.
 */
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { encode as base64Encode } from 'base64-arraybuffer';

type BeepKind = 'start' | 'end';

function _writeString(view: DataView, offset: number, s: string) {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}

function _makeWavPcm16MonoBase64(opts: {
  frequencyHz: number;
  durationMs: number;
  sampleRate?: number;
  amplitude?: number; // 0..1
}): string {
  const sampleRate = opts.sampleRate ?? 44100;
  const amplitude = Math.max(0, Math.min(1, opts.amplitude ?? 0.25));
  const numSamples = Math.max(1, Math.floor((sampleRate * opts.durationMs) / 1000));

  // WAV header (44 bytes) + PCM 16-bit mono samples.
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  _writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  _writeString(view, 8, 'WAVE');
  _writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels = 1
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byteRate = sampleRate * channels * bytesPerSample
  view.setUint16(32, 2, true); // blockAlign = channels * bytesPerSample
  view.setUint16(34, 16, true); // bitsPerSample
  _writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const twoPiF = 2 * Math.PI * opts.frequencyHz;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Quick fade in/out to avoid clicks.
    const fadeLen = Math.min(200, Math.floor(numSamples / 10));
    const fadeIn = i < fadeLen ? i / fadeLen : 1;
    const fadeOut = i > numSamples - fadeLen ? (numSamples - i) / fadeLen : 1;
    const env = Math.max(0, Math.min(1, fadeIn * fadeOut));
    const sample = Math.sin(twoPiF * t) * amplitude * env;
    view.setInt16(44 + i * 2, Math.round(sample * 0x7fff), true);
  }

  return base64Encode(buffer);
}

async function _getBeepUri(kind: BeepKind): Promise<string> {
  const filename = kind === 'start' ? 'beep_start.wav' : 'beep_end.wav';
  const path = `${FileSystem.cacheDirectory}${filename}`;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    const base64 =
      kind === 'start'
        ? _makeWavPcm16MonoBase64({ frequencyHz: 880, durationMs: 120 })
        : _makeWavPcm16MonoBase64({ frequencyHz: 660, durationMs: 120 });
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  return path.startsWith('file://') ? path : `file://${path}`;
}

export async function playBeep(kind: BeepKind): Promise<void> {
  const uri = await _getBeepUri(kind);
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, volume: 1.0 }
  );
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinishAndNotLoop) {
      sound.unloadAsync().catch(() => {});
    }
  });
}

