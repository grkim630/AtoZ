// Service Interfaces for AI Integration

export interface IOpenAIImageAnalysis {
  analyzeImage(imageUri: string): Promise<AnalysisResult>;
}

export interface IKoBERTRiskAssessment {
  assessRisk(text: string): Promise<RiskAssessmentResult>;
}

export interface IAzureSimulation {
  startSimulation(scenarioId: string): Promise<SimulationSession>;
}

// Data Models
export interface AnalysisResult {
  id: string;
  riskScore: number; // 0-100
  detectedKeywords: string[];
  summary: string;
  advice: string;
  timestamp: string;
}

export interface RiskAssessmentResult {
  level: 'Safe' | 'Caution' | 'Danger' | 'Critical';
  probability: number;
  factors: string[];
}

export interface SimulationSession {
  sessionId: string;
  status: 'active' | 'completed' | 'failed';
  logs: SimulationLog[];
}

export interface SimulationLog {
  speaker: 'AI' | 'User';
  message: string;
  timestamp: string;
}

// Phishing Case (Feed/News)
export interface PhishingCase {
  id: string;
  title: string;
  description: string;
  type: 'Voice' | 'Message' | 'Romance' | 'Other';
  date: string;
  riskLevel: number;
  imageUrl?: string;
  viewCount: number;
  likes: number;
}
