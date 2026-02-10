export type ScenarioType =
  | 'romance'
  | 'job'
  | 'sns'
  | 'police'
  | 'court'
  | 'delivery'
  | 'family'
  | 'remittance'
  | 'acquaintance'
  | string;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type CallServerIncomingMessage =
  | {
      type: 'started';
      session_id: string;
      bot_text: string;
      score: number;
      listen_timeout_sec: number;
    }
  | {
      type: 'bot';
      bot_text: string;
      score: number;
      done: boolean;
      listen_timeout_sec: number;
      debug?: string;
    }
  | {
      type: 'summary';
      summary: string;
      score: number;
    }
  | {
      type: 'error';
      message: string;
    };

type StartPayload = {
  type: 'start';
  topic: string;
  difficulty: Difficulty;
};

type UserPayload = {
  type: 'user';
  session_id: string;
  text: string;
};

type TimeoutPayload = {
  type: 'timeout';
  session_id: string;
};

type StopPayload = {
  type: 'stop';
  session_id: string;
};

type OutgoingPayload = StartPayload | UserPayload | TimeoutPayload | StopPayload;

export type VoiceChunk = {
  id: string;
  mimeType: string;
  base64Data: string;
  createdAt: number;
};

type SessionClientOptions = {
  onMessage: (message: CallServerIncomingMessage) => void;
  onVoiceChunk?: (chunk: VoiceChunk) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
  onDebug?: (line: string) => void;
};

const CALL_SERVER_HTTP_BASE_URL =
  process.env.EXPO_PUBLIC_CALL_SERVER_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:8001';

const CALL_SERVER_WS_URL =
  process.env.EXPO_PUBLIC_CALL_SERVER_WS_URL ??
  `${CALL_SERVER_HTTP_BASE_URL.replace(/^http/i, 'ws')}/ws`;

function toTopicFromScenario(type: ScenarioType) {
  const topicMap: Record<string, string> = {
    romance: '로맨스스캠',
    job: '부업 피싱',
    sns: 'SNS 피싱',
    police: '경찰 사칭',
    court: '법원 사칭',
    delivery: '택배 사칭',
    family: '자녀 사칭',
    remittance: '해외 송금 사기',
    acquaintance: '지인 사칭',
  };
  return topicMap[type] ?? '랜덤(혼합형)';
}

export function resolveTopicFromScenario(type?: string) {
  if (!type) {
    return '랜덤(혼합형)';
  }
  return toTopicFromScenario(type);
}

export async function fetchSpeechToken() {
  const response = await fetch(`${CALL_SERVER_HTTP_BASE_URL}/speech-token`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`speech-token failed (${response.status}): ${errorBody}`);
  }
  return (await response.json()) as { token?: string; region?: string; error?: string };
}

export async function probeCallServer() {
  // call_server always mounts /ui (static). Use it as a simple reachability probe.
  const url = `${CALL_SERVER_HTTP_BASE_URL}/ui/`;
  const startedAt = Date.now();
  const response = await fetch(url, { method: 'GET' });
  const elapsedMs = Date.now() - startedAt;
  const body = await response.text();
  return {
    url,
    ok: response.ok,
    status: response.status,
    elapsedMs,
    preview: body.slice(0, 180),
  };
}

export class CallServerSessionClient {
  private socket: WebSocket | null = null;
  private connected = false;
  private readonly options: SessionClientOptions;
  private voiceBuffer: VoiceChunk[] = [];
  private connecting: Promise<void> | null = null;

  constructor(options: SessionClientOptions) {
    this.options = options;
  }

  private debug(line: string) {
    const msg = `[call_server] ${line}`;
    // Expo/React Native: console logs show up in Metro / dev tools.
    // Keep it short but informative.
    // eslint-disable-next-line no-console
    console.log(msg);
    this.options.onDebug?.(msg);
  }

  connect() {
    if (this.socket && this.connected) {
      this.debug(`connect(): already connected (${CALL_SERVER_WS_URL})`);
      return Promise.resolve();
    }
    if (this.connecting) {
      this.debug(`connect(): already connecting (${CALL_SERVER_WS_URL})`);
      return this.connecting;
    }

    this.connecting = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(CALL_SERVER_WS_URL);
      this.socket = socket;
      let settled = false;
      let opened = false;
      this.debug(`connect(): creating websocket url=${CALL_SERVER_WS_URL}`);

      const settleReject = (error: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        this.connecting = null;
        this.debug(
          `connect(): reject error="${error.message}" readyState=${socket.readyState}`,
        );
        this.options.onError?.(error);
        try {
          socket.close();
        } catch {
          // noop
        }
        reject(error);
      };

      const settleResolve = () => {
        if (settled) {
          return;
        }
        settled = true;
        this.connecting = null;
        this.debug(`connect(): resolve readyState=${socket.readyState}`);
        resolve();
      };

      const timeoutId = setTimeout(() => {
        settleReject(
          new Error(
            `call_server websocket connect timeout: ${CALL_SERVER_WS_URL}`,
          ),
        );
      }, 8000);

      socket.onopen = () => {
        opened = true;
        this.connected = true;
        this.debug(`ws:onopen readyState=${socket.readyState}`);
        this.options.onConnectionChange?.(true);
        clearTimeout(timeoutId);
        settleResolve();
      };

      socket.onmessage = (event) => {
        try {
          this.debug(`ws:onmessage bytes=${String(event.data).length}`);
          const data = JSON.parse(String(event.data)) as CallServerIncomingMessage;
          this.options.onMessage(data);
        } catch (error) {
          this.options.onError?.(
            error instanceof Error ? error : new Error('invalid websocket message'),
          );
        }
      };

      socket.onerror = () => {
        clearTimeout(timeoutId);
        this.debug(`ws:onerror readyState=${socket.readyState}`);
        settleReject(
          new Error(`call_server websocket connection error: ${CALL_SERVER_WS_URL}`),
        );
      };

      socket.onclose = (event) => {
        this.connected = false;
        this.options.onConnectionChange?.(false);
        clearTimeout(timeoutId);
        this.debug(
          `ws:onclose opened=${opened} code=${(event as any)?.code ?? '?'} reason="${(event as any)?.reason ?? ''}" wasClean=${(event as any)?.wasClean ?? '?'} readyState=${socket.readyState}`,
        );
        // Some platforms only fire "close" without "error" on connect failure.
        if (!opened) {
          settleReject(
            new Error(
              `call_server websocket closed before open: ${CALL_SERVER_WS_URL}`,
            ),
          );
        }
      };
    });
    return this.connecting;
  }

  disconnect() {
    this.connected = false;
    this.connecting = null;
    if (this.socket) {
      this.debug(`disconnect(): closing readyState=${this.socket.readyState}`);
      this.socket.close();
      this.socket = null;
    }
    this.options.onConnectionChange?.(false);
  }

  startSession({
    scenarioType,
    difficulty = 'medium',
  }: {
    scenarioType?: ScenarioType;
    difficulty?: Difficulty;
  }) {
    const topic = resolveTopicFromScenario(scenarioType);
    this.debug(`send:start topic="${topic}" difficulty=${difficulty}`);
    this.send({ type: 'start', topic, difficulty });
  }

  sendUserText(sessionId: string, text: string) {
    this.debug(`send:user session_id=${sessionId} chars=${text.length}`);
    this.send({
      type: 'user',
      session_id: sessionId,
      text: text.trim() || '(무음)',
    });
  }

  sendTimeout(sessionId: string) {
    this.debug(`send:timeout session_id=${sessionId}`);
    this.send({ type: 'timeout', session_id: sessionId });
  }

  stopSession(sessionId: string) {
    this.debug(`send:stop session_id=${sessionId}`);
    this.send({ type: 'stop', session_id: sessionId });
  }

  pushVoiceChunk(base64Data: string, mimeType = 'audio/pcm') {
    const chunk: VoiceChunk = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      mimeType,
      base64Data,
      createdAt: Date.now(),
    };
    this.voiceBuffer.push(chunk);
    this.options.onVoiceChunk?.(chunk);
  }

  flushVoiceAsText(sessionId: string, transcript?: string) {
    const fallbackText = this.voiceBuffer.length > 0 ? '(음성 입력)' : '(무음)';
    this.debug(
      `flushVoiceAsText(): chunks=${this.voiceBuffer.length} transcript="${
        transcript ?? ''
      }"`,
    );
    this.sendUserText(sessionId, transcript ?? fallbackText);
    this.voiceBuffer = [];
  }

  private send(payload: OutgoingPayload) {
    if (!this.socket || !this.connected) {
      this.debug(
        `send(): blocked connected=${this.connected} readyState=${this.socket?.readyState ?? 'null'}`,
      );
      throw new Error('call_server websocket is not connected');
    }
    this.socket.send(JSON.stringify(payload));
  }
}
