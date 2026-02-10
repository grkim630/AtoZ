/**
 * TTS API로 받은 음성 바이트를 재생합니다.
 * fetchPhoneTts → 파일로 저장 → expo-av로 재생
 */
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { encode as base64Encode } from 'base64-arraybuffer';
import { fetchPhoneTts } from './phishingSimulationService';

export type PlayTtsOptions = {
  sessionId: string;
  text: string;
  onDone?: () => void;
  onError?: (err: Error) => void;
};

let currentSound: Audio.Sound | null = null;

export async function stopTts(): Promise<void> {
  const sound = currentSound;
  currentSound = null;
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {
    // ignore
  }
  try {
    await sound.unloadAsync();
  } catch {
    // ignore
  }
}

/**
 * sessionId와 text로 TTS를 요청하고, 받은 음성을 재생합니다.
 * 재생이 끝나면 onDone, 실패 시 onError 호출.
 */
export async function playTts(options: PlayTtsOptions): Promise<void> {
  const { sessionId, text, onDone, onError } = options;

  try {
    // 이전 재생이 남아있으면 즉시 중단 (겹쳐 재생되는 것 방지)
    await stopTts();

    const res = await fetchPhoneTts(sessionId, text);
    const arrayBuffer = await res.arrayBuffer();
    const base64 = base64Encode(arrayBuffer);

    const filename = `tts_${Date.now()}.mp3`;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const uri = path.startsWith('file://') ? path : `file://${path}`;

    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
    currentSound = sound;

    // 재생 완료까지 sound 객체가 살아있도록 Promise로 유지
    // (일부 안드로이드 기기에서 didJustFinish가 누락될 수 있어 position/duration로 보정 + 타임아웃 추가)
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const settleOk = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (currentSound === sound) currentSound = null;
        sound.unloadAsync().catch(() => {});
        onDone?.();
        resolve();
      };
      const settleErr = (e: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        if (currentSound === sound) currentSound = null;
        sound.unloadAsync().catch(() => {});
        reject(e);
      };

      // 최후의 안전장치: 30초가 지나면 종료로 간주
      const timeoutId = setTimeout(() => settleOk(), 30_000);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          // @ts-expect-error - expo-av PlaybackStatus has error on unloaded states
          const err = (status as any).error;
          if (err) settleErr(new Error(String(err)));
          return;
        }

        if (status.didJustFinishAndNotLoop) {
          settleOk();
          return;
        }

        // didJustFinish가 안 오는 플랫폼 보정
        const pos = typeof status.positionMillis === 'number' ? status.positionMillis : null;
        const dur = typeof status.durationMillis === 'number' ? status.durationMillis : null;
        if (pos != null && dur != null && dur > 0 && pos >= dur - 250) {
          settleOk();
        }
      });

      sound.playAsync().catch((e) => settleErr(e));
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    throw error;
  }
}
