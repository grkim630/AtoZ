export interface ComparisonScore {
  label: string;
  average: number; // 0-100
  user: number; // 0-100
}

export interface AnalysisResult {
  label: 'phishing' | 'normal';
  riskScore: number; // 0-100 (floor applied)
  riskLevel: '안전' | '위험';
  statusMessage: '주의하세요.' | '피싱에 안전합니다.';
  verdictTitle: string;
  verdictDescription: string;
  comparisonData: ComparisonScore[];
}

interface AnalyzeFileInput {
  uri: string;
  name?: string;
  mimeType?: string;
}

type UploadType = 'VOICE' | 'IMAGE' | 'TEXT';

type AuthAutoResponse = {
  accessToken: string;
};

type UploadResponse = {
  id: string;
};

type PipelineResponse = {
  status: 'success' | 'failed';
  errorMessage?: string;
  stageResults?: {
    extraction?: {
      summary?: string;
    };
    classification?: {
      predictedType?: string;
      debug?: {
        riskLabel?: 'phishing' | 'normal';
        riskScore?: number; // backend: usually 0~1
      };
    };
  };
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://127.0.0.1:3000';

let cachedAccessToken: string | null = null;
let lastAnalysisResult: AnalysisResult | null = null;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toRiskPercent(rawRiskScore: number) {
  // Backend can return either 0~1 or 0~100 depending on model/output.
  const normalized = rawRiskScore <= 1 ? rawRiskScore * 100 : rawRiskScore;
  return Math.floor(clamp(normalized, 0, 100));
}

function createRandomPairWithMean(mean: number) {
  const spread = 12;
  for (let i = 0; i < 30; i += 1) {
    const first = Math.floor(
      clamp(
        mean + (Math.random() * 2 - 1) * spread,
        0,
        100,
      ),
    );
    const second = mean * 2 - first;
    if (second >= 0 && second <= 100) {
      return [first, second];
    }
  }
  return [mean, mean];
}

async function requestAutoToken() {
  const response = await fetch(`${API_BASE_URL}/auth/auto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`auth/auto failed (${response.status})`);
  }
  const data = (await response.json()) as AuthAutoResponse;
  if (!data.accessToken) {
    throw new Error('accessToken is missing from auth/auto response');
  }
  cachedAccessToken = data.accessToken;
  return data.accessToken;
}

async function getAccessToken() {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  return requestAutoToken();
}

function resolveUploadType(input: AnalyzeFileInput): UploadType {
  const mime = (input.mimeType ?? '').toLowerCase();
  const name = (input.name ?? '').toLowerCase();
  if (mime.startsWith('audio/') || /\.(m4a|mp3|wav|aac|ogg|webm)$/.test(name)) {
    return 'VOICE';
  }
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|heic)$/.test(name)) {
    return 'IMAGE';
  }
  return 'TEXT';
}

async function uploadFile(input: AnalyzeFileInput, accessToken: string) {
  const type = resolveUploadType(input);
  const filename =
    input.name ?? (type === 'VOICE' ? 'upload.m4a' : type === 'IMAGE' ? 'upload.jpg' : 'upload.txt');
  const mimeType =
    input.mimeType ??
    (type === 'VOICE'
      ? 'audio/m4a'
      : type === 'IMAGE'
        ? 'image/jpeg'
        : 'text/plain');

  const formData = new FormData();
  formData.append('type', type);
  formData.append('file', {
    uri: input.uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`uploads failed (${response.status}): ${errorBody}`);
  }
  return (await response.json()) as UploadResponse;
}

async function runAnalysisPipeline(uploadedFileId: string, accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/analysis/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ uploadedFileId }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`analysis/pipeline failed (${response.status}): ${errorBody}`);
  }
  return (await response.json()) as PipelineResponse;
}

function mapPipelineToResult(pipeline: PipelineResponse): AnalysisResult {
  if (pipeline.status !== 'success') {
    throw new Error(pipeline.errorMessage ?? 'Analysis pipeline failed');
  }
  const debug = pipeline.stageResults?.classification?.debug;
  const label = debug?.riskLabel === 'phishing' ? 'phishing' : 'normal';
  const riskScore = toRiskPercent(Number(debug?.riskScore ?? 0));
  const predictedType = pipeline.stageResults?.classification?.predictedType;
  const extractionSummary = pipeline.stageResults?.extraction?.summary;
  const [wordBar, contextBar] = createRandomPairWithMean(riskScore);
  const averageRiskBar = Math.min(riskScore, 80);
  const verdictTitle = predictedType?.trim()
    ? predictedType
    : label === 'phishing'
      ? '피싱 의심 유형'
      : '일상 대화';
  const verdictDescription = extractionSummary?.trim()
    ? extractionSummary
    : label === 'phishing'
      ? '의심 정황이 있어 추가 확인이 필요합니다.'
      : '분석 결과 위험 신호가 낮습니다.';

  return {
    label,
    riskScore,
    riskLevel: label === 'phishing' ? '위험' : '안전',
    statusMessage: label === 'phishing' ? '주의하세요.' : '피싱에 안전합니다.',
    verdictTitle,
    verdictDescription,
    comparisonData: [
      { label: '단어', average: averageRiskBar, user: wordBar },
      { label: '문맥', average: averageRiskBar, user: contextBar },
      { label: '종합', average: averageRiskBar, user: riskScore },
    ],
  };
}

export const analyzeFile = async (
  input: string | AnalyzeFileInput,
): Promise<AnalysisResult> => {
  const normalizedInput: AnalyzeFileInput =
    typeof input === 'string' ? { uri: input } : input;
  const accessToken = await getAccessToken();
  let firstErrorMessage = '';

  try {
    const uploaded = await uploadFile(normalizedInput, accessToken);
    const pipeline = await runAnalysisPipeline(uploaded.id, accessToken);
    const mapped = mapPipelineToResult(pipeline);
    lastAnalysisResult = mapped;
    return mapped;
  } catch (error) {
    firstErrorMessage =
      error instanceof Error ? error.message : String(error);
    // Token can expire. Retry once with a fresh guest token.
    cachedAccessToken = null;
    try {
      const refreshedToken = await getAccessToken();
      const uploaded = await uploadFile(normalizedInput, refreshedToken);
      const pipeline = await runAnalysisPipeline(uploaded.id, refreshedToken);
      const mapped = mapPipelineToResult(pipeline);
      lastAnalysisResult = mapped;
      return mapped;
    } catch (retryError) {
      const retryErrorMessage =
        retryError instanceof Error ? retryError.message : String(retryError);
      throw new Error(
        `분석 요청 실패: first=${firstErrorMessage} / retry=${retryErrorMessage}`,
      );
    }
  }
};

export const getLastAnalysisResult = () => lastAnalysisResult;
