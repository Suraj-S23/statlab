/**
 * Shared TypeScript types used across the frontend.
 * These mirror the Pydantic models defined in the FastAPI backend.
 */

/** Metadata for a single column parsed from the uploaded CSV. */
export interface Column {
  name: string
  type: "numeric" | "categorical" | "boolean"
  missing: number
}

/** Response returned by the /api/upload endpoint. */
export interface UploadResponse {
  session_id: string
  filename: string
  rows: number
  columns: Column[]
  preview: Record<string, string | number>[]
  data: Record<string, string | number>[] 
}

/** A single statistical test suggestion returned by /api/suggest. */
export interface Suggestion {
  test: string
  reason: string
  columns_needed: string
  tier: number
}

/** Descriptive statistics for a single column. */
export interface ColumnStats {
  count: number
  mean: number
  median: number
  std: number
  min: number
  max: number
  q1: number
  q3: number
  iqr: number
  skewness: number
  kurtosis: number
  outliers: number
}

/** Full descriptive statistics result — keyed by column name. */
export type DescriptiveResults = Record<string, ColumnStats>