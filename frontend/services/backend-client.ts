const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

type JsonRecord = Record<string, unknown>;

let cachedToken: string | null = null;

async function request<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: JsonRecord;
    auth?: boolean;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth) {
    const token = await ensureGuestToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[${response.status}] ${text || "request failed"}`);
  }

  return (await response.json()) as T;
}

export async function ensureGuestToken() {
  if (cachedToken) {
    return cachedToken;
  }

  const response = await request<{ accessToken: string }>("/auth/auto", {
    method: "POST",
  });
  cachedToken = response.accessToken;
  return cachedToken;
}

export function clearCachedToken() {
  cachedToken = null;
}

export async function apiGet<T>(path: string, auth = true) {
  return request<T>(path, { method: "GET", auth });
}

export async function apiPost<T>(path: string, body: JsonRecord, auth = true) {
  return request<T>(path, { method: "POST", body, auth });
}
