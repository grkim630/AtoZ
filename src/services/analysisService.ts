export interface ComparisonScore {
  label: string;
  average: number; // 0-100
  user: number;    // 0-100
}

export interface AnalysisResult {
  riskScore: number; // 0-100
  riskLevel: '안전' | '주의' | '위험';
  diffFromAvg: number; // percentage difference, e.g. 32
  comparisonData: ComparisonScore[];
  verdictTitle: string;
  verdictDescription: string;
}

export const analyzeFile = async (fileUri: string): Promise<AnalysisResult> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        riskScore: 79,
        riskLevel: '위험',
        diffFromAvg: 32,
        comparisonData: [
          { label: '단어', average: 45, user: 60 },
          { label: '문맥', average: 50, user: 75 },
          { label: '종합', average: 55, user: 85 },
        ],
        verdictTitle: '기관 사칭형 피싱',
        verdictDescription: '경찰을 사칭한 전화가 왔어요.',
      });
    }, 3000); // 3 seconds delay for "Analyzing..." animation
  });
};
