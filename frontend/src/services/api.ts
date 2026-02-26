/**
 * API service layer.
 *
 * Uses a relative base URL (/api) so it works in both environments:
 * - Dev: Vite proxies /api → http://localhost:8000
 * - Docker/prod: Nginx proxies /api → http://backend:8000
 */

import type {
  UploadResponse, Suggestion, Column,
  DescriptiveResults, TwoGroupResults, AnovaResults,
  CorrelationResults, RegressionResults, ChiSquareResults,
  DoseResponseResults, KaplanMeierResults,
} from "../types"

const BASE_URL = import.meta.env.VITE_API_URL 
  ?? "https://labrat-backend-production.up.railway.app/api"
  
async function post<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }
  return response.json()
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }
  return response.json()
}

export async function getSuggestions(session_id: string, columns: Column[]): Promise<Suggestion[]> {
  return post("/suggest", { session_id, columns })
}

export async function runDescriptive(session_id: string, columns: string[]): Promise<DescriptiveResults> {
  return post("/analysis/descriptive", { session_id, columns })
}

export async function runTwoGroup(session_id: string, group_col: string, value_col: string): Promise<TwoGroupResults> {
  return post("/analysis/two-group", { session_id, group_col, value_col })
}

export async function runAnova(session_id: string, group_col: string, value_col: string): Promise<AnovaResults> {
  return post("/analysis/anova", { session_id, group_col, value_col })
}

export async function runCorrelation(session_id: string, col_a: string, col_b: string): Promise<CorrelationResults> {
  return post("/analysis/correlation", { session_id, col_a, col_b })
}

export async function runRegression(session_id: string, col_a: string, col_b: string): Promise<RegressionResults> {
  return post("/analysis/regression", { session_id, col_a, col_b })
}

export async function runChiSquare(session_id: string, col_a: string, col_b: string): Promise<ChiSquareResults> {
  return post("/analysis/chi-square", { session_id, col_a, col_b })
}

export async function runDoseResponse(session_id: string, col_a: string, col_b: string): Promise<DoseResponseResults> {
  return post("/analysis/dose-response", { session_id, col_a, col_b })
}

export async function runKaplanMeier(session_id: string, time_col: string, event_col: string, group_col?: string): Promise<KaplanMeierResults> {
  return post("/analysis/kaplan-meier", { session_id, time_col, event_col, group_col })
}
