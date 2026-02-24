/**
 * API service layer — all calls to the FastAPI backend go through here.
 * This keeps fetch logic out of components and makes it easy to swap
 * the base URL for production later.
 */

import type {
  UploadResponse,
  Suggestion,
  Column,
  DescriptiveResults,
  TwoGroupResults,
  AnovaResults,
  CorrelationResults,
  RegressionResults,
  ChiSquareResults,
  DoseResponseResults,
  KaplanMeierResults,
} from "../types"

const BASE_URL = "http://localhost:8000/api"

/** Generic POST helper to reduce repetition. */
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

/**
 * Upload a CSV file. Returns a session ID and metadata.
 * The full dataset is stored server-side in Redis.
 */
export async function uploadCSV(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }
  return response.json()
}

/** Send column metadata and receive recommended statistical tests. */
export async function getSuggestions(columns: Column[]): Promise<Suggestion[]> {
  return post("/suggest", columns)
}

/** Run descriptive statistics on selected numeric columns. */
export async function runDescriptive(
  session_id: string,
  columns: string[]
): Promise<DescriptiveResults> {
  return post("/analysis/descriptive", { session_id, columns })
}

/** Run two-group comparison (t-test / Mann-Whitney U). */
export async function runTwoGroup(
  session_id: string,
  group_col: string,
  value_col: string
): Promise<TwoGroupResults> {
  return post("/analysis/two-group", { session_id, group_col, value_col })
}

/** Run one-way ANOVA and Kruskal-Wallis. */
export async function runAnova(
  session_id: string,
  group_col: string,
  value_col: string
): Promise<AnovaResults> {
  return post("/analysis/anova", { session_id, group_col, value_col })
}

/** Run Pearson and Spearman correlation. */
export async function runCorrelation(
  session_id: string,
  col_a: string,
  col_b: string
): Promise<CorrelationResults> {
  return post("/analysis/correlation", { session_id, col_a, col_b })
}

/** Run simple linear regression. */
export async function runRegression(
  session_id: string,
  col_a: string,
  col_b: string
): Promise<RegressionResults> {
  return post("/analysis/regression", { session_id, col_a, col_b })
}

/** Run chi-square / Fisher's exact test. */
export async function runChiSquare(
  session_id: string,
  col_a: string,
  col_b: string
): Promise<ChiSquareResults> {
  return post("/analysis/chi-square", { session_id, col_a, col_b })
}

/** Fit a dose-response curve and compute IC50. */
export async function runDoseResponse(
  session_id: string,
  col_a: string,
  col_b: string
): Promise<DoseResponseResults> {
  return post("/analysis/dose-response", { session_id, col_a, col_b })
}

/** Run Kaplan-Meier survival analysis. */
export async function runKaplanMeier(
  session_id: string,
  time_col: string,
  event_col: string,
  group_col?: string
): Promise<KaplanMeierResults> {
  return post("/analysis/kaplan-meier", { session_id, time_col, event_col, group_col })
}