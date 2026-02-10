/**
 * phishing_simulation 백엔드 API 클라이언트
 * 
 * 독립적인 FastAPI 서비스 (http://127.0.0.1:8010)와 통신합니다.
 * 기존 NestJS 백엔드(analysisService)와는 별개입니다.
 */

// =========================
// 타입 정의
// =========================

export type PhoneCategory =
  | '검찰/경찰 사칭'
  | '금융기관 사칭'
  | '자녀/지인 사칭'
  | '택배/배송 사칭'
  | '해외 송금/범죄 연루 사칭';

export type MessageCategory =
  | '택배 문자'
  | '금융기관 알림'
  | '계정 정지/보안 경고'
  | '지인 사칭 링크';

export type Difficulty = 1 | 2 | 3;

export interface Scenario {
  channel: 'phone' | 'message';
  category: string;
  attacker_role: string;
  objective: string;
  stages: Array<{
    name: string;
    goal: string;
    pressure_tactics: string[];
    red_lines: string[];
  }>;
  opening_line: string;
}

export interface CreatePhoneSessionRequest {
  category: PhoneCategory;
  difficulty?: Difficulty;
  seed?: number;
  recommended_delay_seconds_min?: number;
  recommended_delay_seconds_max?: number;
}

export interface CreatePhoneSessionResponse {
  sessionId: string;
  scenario: Scenario;
  firstAssistantMessage: string;
  recommendedDelaySeconds: number;
  stageIndex: number;
}

export interface CreateMessageSessionRequest {
  category: MessageCategory;
  difficulty?: Difficulty;
  seed?: number;
  recommended_delay_seconds_min?: number;
  recommended_delay_seconds_max?: number;
}

export interface CreateMessageSessionResponse {
  sessionId: string;
  scenario: Scenario;
  firstAssistantMessage: string;
  recommendedDelaySeconds: number;
  stageIndex: number;
}

export interface ReplyRequest {
  text: string;
}

export interface ReplyResponse {
  assistantText: string;
  stageIndex: number;
  shouldEnd: boolean;
}

export interface SttResponse {
  text: string;
}

export interface ConversationState {
  session_id: string;
  scenario: Scenario;
  stage_index: number;
  history: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  created_at_ms: number;
  updated_at_ms: number;
}

// =========================
// 설정
// =========================

const SIMULATION_API_BASE_URL =
  process.env.EXPO_PUBLIC_SIMULATION_API_BASE_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:8010';

// =========================
// 유틸리티
// =========================

async function request<T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const url = `${SIMULATION_API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options?.headers,
  };

  const config: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  };

  if (options?.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage: string;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.detail ?? errorBody;
    } catch {
      errorMessage = errorBody;
    }
    throw new Error(
      `phishing_simulation API error (${response.status}): ${errorMessage}`,
    );
  }

  return response.json() as Promise<T>;
}

// =========================
// 전화 피싱 API
// =========================

export async function createPhoneScenario(
  category: PhoneCategory,
  difficulty: Difficulty = 2,
  seed?: number,
): Promise<{ scenario: Scenario }> {
  return request('/phone/scenarios', {
    method: 'POST',
    body: { category, difficulty, seed },
  });
}

export async function createPhoneSession(
  req: CreatePhoneSessionRequest,
): Promise<CreatePhoneSessionResponse> {
  return request('/phone/sessions', {
    method: 'POST',
    body: {
      category: req.category,
      difficulty: req.difficulty ?? 2,
      seed: req.seed,
      recommended_delay_seconds_min: req.recommended_delay_seconds_min ?? 3,
      recommended_delay_seconds_max: req.recommended_delay_seconds_max ?? 5,
    },
  });
}

export async function getPhoneSession(
  sessionId: string,
): Promise<ConversationState> {
  return request(`/phone/sessions/${sessionId}`);
}

export async function deletePhoneSession(sessionId: string): Promise<{ ok: boolean }> {
  return request(`/phone/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function transcribePhoneAudio(
  sessionId: string,
  audioFile: { uri: string; name?: string; type?: string },
): Promise<SttResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: audioFile.uri,
    name: audioFile.name ?? 'audio.webm',
    type: audioFile.type ?? 'audio/webm',
  } as unknown as Blob);

  const url = `${SIMULATION_API_BASE_URL}/phone/sessions/${sessionId}/stt`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage: string;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.detail ?? errorBody;
    } catch {
      errorMessage = errorBody;
    }
    throw new Error(
      `STT API error (${response.status}): ${errorMessage}`,
    );
  }

  return response.json() as Promise<SttResponse>;
}

export async function sendPhoneReply(
  sessionId: string,
  text: string,
): Promise<ReplyResponse> {
  return request(`/phone/sessions/${sessionId}/reply`, {
    method: 'POST',
    body: { text },
  });
}

/**
 * 전화 체험용 TTS: 텍스트 → 음성 바이트 (Azure Speech 사용 시)
 * 반환: Response (audio/mpeg 등). blob()으로 재생 가능.
 */
export async function fetchPhoneTts(
  sessionId: string,
  text: string,
): Promise<Response> {
  const url = `${SIMULATION_API_BASE_URL}/phone/sessions/${sessionId}/tts`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS API error (${response.status}): ${err}`);
  }
  return response;
}

// =========================
// 문자(메시지) 피싱 API
// =========================

export async function createMessageScenario(
  category: MessageCategory,
  difficulty: Difficulty = 2,
  seed?: number,
): Promise<{ scenario: Scenario }> {
  return request('/message/scenarios', {
    method: 'POST',
    body: { category, difficulty, seed },
  });
}

export async function createMessageSession(
  req: CreateMessageSessionRequest,
): Promise<CreateMessageSessionResponse> {
  return request('/message/sessions', {
    method: 'POST',
    body: {
      category: req.category,
      difficulty: req.difficulty ?? 2,
      seed: req.seed,
      recommended_delay_seconds_min: req.recommended_delay_seconds_min ?? 2,
      recommended_delay_seconds_max: req.recommended_delay_seconds_max ?? 4,
    },
  });
}

export async function getMessageSession(
  sessionId: string,
): Promise<ConversationState> {
  return request(`/message/sessions/${sessionId}`);
}

export async function deleteMessageSession(sessionId: string): Promise<{ ok: boolean }> {
  return request(`/message/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function sendMessageReply(
  sessionId: string,
  text: string,
): Promise<ReplyResponse> {
  return request(`/message/sessions/${sessionId}/reply`, {
    method: 'POST',
    body: { text },
  });
}

// =========================
// 헬스 체크
// =========================

export async function checkSimulationServerHealth(): Promise<{ ok: boolean }> {
  try {
    return await request('/health');
  } catch (error) {
    throw new Error(
      `phishing_simulation 서버에 연결할 수 없습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
