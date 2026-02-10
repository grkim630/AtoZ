import { apiGet, apiPost } from "./backend-client";

type ScenarioResponse = {
  id: string;
  type: "chat" | "call";
  source: "scriptFile" | "ttsFile";
  content?: string;
  filePath?: string;
  keyword: string;
};

type SessionResponse = {
  id: string;
  scriptId: string;
  channel: "CHAT" | "CALL";
};

type SessionResult = {
  sessionId: string;
  status: string;
  overallScore: number;
  label: "A" | "B" | "C" | "D" | "E";
  educationTips: string[];
  categories: Array<{
    categoryCode: string;
    finalScore: number;
    label: "A" | "B" | "C" | "D" | "E";
  }>;
};

export async function fetchChatScenario(keyword = "택배") {
  return apiGet<ScenarioResponse>(
    `/experience/scenario?keyword=${encodeURIComponent(keyword)}&type=chat`,
  );
}

export async function createChatSession(scriptId: string) {
  return apiPost<SessionResponse>("/sessions", {
    scriptId,
    channel: "CHAT",
    llmModelVersion: "gpt-4o-mini",
    scriptVersion: 1,
  });
}

export async function addSessionMessage(
  sessionId: string,
  payload: {
    turnIndex: number;
    speaker: "USER" | "AGENT";
    text: string;
    maskedText?: string;
  },
) {
  return apiPost(`/sessions/${sessionId}/messages`, payload);
}

export async function addSessionEvent(
  sessionId: string,
  payload: {
    eventType: "CHOICE" | "INPUT" | "HANGUP" | "REPORT";
    actionCode: string;
    riskWeight: number;
    stepNo?: number;
  },
) {
  return apiPost(`/sessions/${sessionId}/events`, payload);
}

export async function submitSurvey(
  sessionId: string,
  payload: {
    realism: number;
    helpfulness: number;
    confidence: number;
    riskyFactor: string;
  },
) {
  return apiPost(`/sessions/${sessionId}/survey`, {
    answersJson: payload,
    isSkipped: false,
  });
}

export async function runEvaluation(sessionId: string) {
  await apiPost(`/sessions/${sessionId}/evaluate`, {
    promptVersion: "v1",
    model: "gpt-4o-mini",
  });
  await apiPost(`/sessions/${sessionId}/finalize`, {});
  return apiGet<SessionResult>(`/sessions/${sessionId}/result`);
}
