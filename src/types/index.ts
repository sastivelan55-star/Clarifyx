export type ScanType = "url" | "message" | "image" | "video" | "fake_news" | "voice" | "URL" | "MESSAGE" | "IMAGE" | "VIDEO" | "FAKE_NEWS" | "VOICE";

export type ScanStatus = 
  | "idle" 
  | "validating" 
  | "uploading" 
  | "processing" 
  | "success" 
  | "error" 
  | "cancelled"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type RiskLevel = "Safe" | "Suspicious" | "Dangerous" | "SAFE" | "SUSPICIOUS" | "DANGEROUS";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface DetectionResult {
  category: string;
  confidence: number;
  description: string;
}

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  explanation: string;
  detections: DetectionResult[];
}

export interface Scan {
  id: string;
  type: ScanType;
  scanType?: ScanType;
  target: string; // The URL, message excerpt, or file name
  status: ScanStatus;
  createdAt: string;
  completedAt?: string;
  result?: ScanResult;
  Result?: any;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: Pagination;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
