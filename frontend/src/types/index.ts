/**
 * Shared TypeScript types used across the frontend.
 * These mirror the Pydantic models defined in the FastAPI backend.
 */

/** Metadata for a single column parsed from the uploaded CSV. */
export interface Column {
  name: string
  type: "numeric" | "categorical"
  missing: number
}

/** Response returned by the /api/upload endpoint. */
export interface UploadResponse {
  filename: string
  rows: number
  columns: Column[]
  preview: Record<string, string | number>[]
}

/** A single statistical test suggestion returned by /api/suggest. */
export interface Suggestion {
  test: string
  reason: string
  columns_needed: string
  tier: number
}