/**
 * HospitalNet Frontend API Client Library.
 * Connects Next.js to FastAPI backend endpoints.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  demo_mode: boolean;
  model_file_exists: boolean;
  model_path: string;
  hospitals_participating: number;
  hospital_partitions: Record<string, { normal_samples: number; pneumonia_samples: number; total_samples: number }>;
  disclaimer: string;
}

export interface PredictionResult {
  id: number;
  filename: string;
  image_path?: string;
  prediction: "Normal" | "Pneumonia";
  confidence: number;
  probabilities: {
    Normal: number;
    Pneumonia: number;
  };
  model: string;
  is_demo: boolean;
  timestamp: string;
  message: string;
  disclaimer: string;
}

export interface SampleImage {
  id: string;
  label: string;
  expected: "Normal" | "Pneumonia";
  download_url: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  location: string;
  specialty: string;
  description: string;
  data_path: string;
  status: string;
}

export interface RoundSummary {
  round: number;
  global_accuracy: number;
  global_loss: number;
  hospitals: Record<string, { accuracy: number; loss: number; samples: number }>;
}

export interface TrainingLogEntry {
  timestamp: string;
  message: string;
  hospital_id?: string | null;
}

export interface TrainingStatus {
  is_running: boolean;
  session_id: string | null;
  status: "idle" | "running" | "completed" | "failed";
  current_round: number;
  total_rounds: number;
  global_accuracy?: number;
  global_loss?: number;
  step_message: string;
  hospitals: Record<string, {
    name: string;
    status: string;
    accuracy: number;
    loss: number;
    samples: number;
  }>;
  rounds_history: RoundSummary[];
  logs: TrainingLogEntry[];
}

export interface HistoryRecord {
  id: number;
  filename: string;
  image_path?: string;
  prediction: string;
  confidence: number;
  probabilities?: { Normal: number; Pneumonia: number };
  model_version: string;
  is_demo: boolean;
  timestamp: string;
}

export interface HistoryStats {
  total_predictions: number;
  normal_count: number;
  pneumonia_count: number;
  average_confidence: number;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to connect to HospitalNet backend.");
  return res.json();
}

export async function predictXray(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Prediction request failed.");
  }
  return res.json();
}

export async function fetchSampleImages(): Promise<SampleImage[]> {
  const res = await fetch(`${API_BASE_URL}/api/predict/samples`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.samples || [];
}

export async function startTraining(rounds: number = 3, localEpochs: number = 1, demoMode?: boolean) {
  const res = await fetch(`${API_BASE_URL}/api/training/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rounds,
      local_epochs: localEpochs,
      demo_mode: demoMode,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to start training.");
  }
  return res.json();
}

export async function fetchTrainingStatus(): Promise<TrainingStatus> {
  const res = await fetch(`${API_BASE_URL}/api/training/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch training status.");
  return res.json();
}

export async function fetchHospitals(): Promise<HospitalInfo[]> {
  const res = await fetch(`${API_BASE_URL}/api/training/hospitals`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.hospitals || [];
}

export async function fetchHistory(limit: number = 50, offset: number = 0): Promise<{ total: number; records: HistoryRecord[] }> {
  const res = await fetch(`${API_BASE_URL}/api/history?limit=${limit}&offset=${offset}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load history.");
  return res.json();
}

export async function fetchHistoryStats(): Promise<HistoryStats> {
  const res = await fetch(`${API_BASE_URL}/api/history/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load history stats.");
  return res.json();
}

export async function deleteHistoryRecord(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/history/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete record.");
}

export async function clearAllHistory(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/history`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear history.");
}
