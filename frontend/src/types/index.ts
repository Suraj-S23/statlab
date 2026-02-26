/**
 * Shared TypeScript types used across the frontend.
 * These mirror the Pydantic models defined in the FastAPI backend.
 */

export interface Column {
  name: string
  type: "numeric" | "categorical" | "boolean"
  missing: number
  unique_count: number
}

export interface UploadResponse {
  session_id: string
  filename: string
  rows: number
  columns: Column[]
  preview: Record<string, string | number>[]
}

export interface Suggestion {
  test: string
  reason: string
  columns_needed: string
  tier: number
  warning?: string
  disabled?: boolean 
}

/** A single histogram bin for chart display. */
export interface HistogramBin {
  bin_label: string
  count: number
}

/** A single {x, y} point for scatter plot display. */
export interface ScatterPoint {
  x: number
  y: number
}

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
  histogram: HistogramBin[]
}

export type DescriptiveResults = Record<string, ColumnStats>

export interface GroupSummary {
  n: number
  mean: number
  median: number
  std: number
  normality_p: number | null
  normality: string
  points: number[]
}

export interface TwoGroupResults {
  group_column: string
  value_column: string
  groups: Record<string, GroupSummary>
  t_test: { statistic: number; p_value: string; significant: boolean }
  mann_whitney: { statistic: number; p_value: string; significant: boolean }
  recommended_test: string
  interpretation: string
}

export interface AnovaGroupSummary {
  n: number
  mean: number
  median: number
  std: number
  points: number[]
}

export interface AnovaResults {
  group_column: string
  value_column: string
  n_groups: number
  skipped_groups: string[]
  groups: Record<string, AnovaGroupSummary>
  anova: { f_statistic: number; p_value: string; significant: boolean }
  kruskal_wallis: { h_statistic: number; p_value: string; significant: boolean }
  interpretation: string
}

export interface CorrelationResults {
  col_a: string
  col_b: string
  n: number
  pearson: { r: number; p_value: string; significant: boolean }
  spearman: { rho: number; p_value: string; significant: boolean }
  interpretation: string
  scatter: ScatterPoint[]
}

export interface RegressionResults {
  predictor: string
  outcome: string
  n: number
  slope: number
  intercept: number
  r_squared: number
  r_value: number
  p_value: string
  std_err: number
  significant: boolean
  interpretation: string
  scatter: ScatterPoint[]
  line: ScatterPoint[]
}

export interface ChiSquareResults {
  col_a: string
  col_b: string
  n: number
  chi_square: { statistic: number; p_value: string; dof: number; significant: boolean }
  fisher: { odds_ratio: number; p_value: string; significant: boolean } | null
  assumption_warning: string | null
  interpretation: string
}

export interface DoseResponseResults {
  concentration_col: string
  response_col: string
  n: number
  ic50: number
  hill_slope: number
  bottom: number
  top: number
  r_squared: number
  curve_x: number[]
  curve_y: number[]
  data_x: number[]
  data_y: number[]
  interpretation: string
}

export interface SurvivalPoint {
  time: number
  survival: number
}

export interface KaplanMeierResults {
  time_col: string
  event_col: string
  n: number
  curve?: SurvivalPoint[]
  median_survival?: number | null
  groups?: Record<string, {
    curve: SurvivalPoint[]
    median_survival: number | null
    n: number
  }>
  interpretation: string
}
export interface ContingencyTable {
  row_labels: string[]
  col_labels: string[]
  values: number[][]
}