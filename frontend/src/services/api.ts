/**
 * API service layer — all calls to the FastAPI backend go through here.
 * This keeps fetch logic out of components and makes it easy to swap
 * the base URL for production later.
 */

import type { UploadResponse, Suggestion, Column, DescriptiveResults, TwoGroupResults } from "../types"

const BASE_URL = "http://localhost:8000/api"

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

/**
 * Send column metadata to the backend and receive a list of
 * recommended statistical tests.
 */
export async function getSuggestions(columns: Column[]): Promise<Suggestion[]> {
  const response = await fetch(`${BASE_URL}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(columns),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }

  return response.json()
}

/**
 * Run descriptive statistics using the session ID.
 * The backend retrieves the full dataset from Redis.
 */
export async function runDescriptive(
  session_id: string,
  columns: string[]
): Promise<DescriptiveResults> {
  const response = await fetch(`${BASE_URL}/analysis/descriptive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, columns }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }

  return response.json()
}

/**
 * Run a two-group comparison (t-test / Mann-Whitney U).
 */
export async function runTwoGroup(
  session_id: string,
  group_col: string,
  value_col: string
): Promise<TwoGroupResults> {
  const response = await fetch(`${BASE_URL}/analysis/two-group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, group_col, value_col }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail)
  }

  return response.json()
}