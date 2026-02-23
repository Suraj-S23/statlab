/**
 * API service layer — all calls to the FastAPI backend go through here.
 * This keeps fetch logic out of components and makes it easy to swap
 * the base URL for production later.
 */

import type { UploadResponse, Suggestion, Column } from "../types"

const BASE_URL = "http://localhost:8000/api"

/**
 * Upload a CSV file and receive parsed column metadata and a data preview.
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