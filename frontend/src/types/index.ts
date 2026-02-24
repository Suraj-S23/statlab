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

/** Group summary statistics for two-group comparison. */
export interface GroupSummary {
  n: number
  mean: number
  median: number
  std: number
  normality_p: number | null
  normality: string
}

/** Result of a two-group comparison (t-test / Mann-Whitney). */
export interface TwoGroupResults {
  group_column: string
  value_column: string
  groups: Record<string, GroupSummary>
  t_test: { statistic: number; p_value: string; significant: boolean }
  mann_whitney: { statistic: number; p_value: string; significant: boolean }
  recommended_test: string
  interpretation: string
}

/** Per-group summary for ANOVA. */
export interface AnovaGroupSummary {
  n: number
  mean: number
  median: number
  std: number
}

/** Result of a one-way ANOVA analysis. */
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

/** Result of a correlation analysis. */
export interface CorrelationResults {
  col_a: string
  col_b: string
  n: number
  pearson: { r: number; p_value: string; significant: boolean }
  spearman: { rho: number; p_value: string; significant: boolean }
  interpretation: string
}

/** Result of a linear regression analysis. */
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
}

/** Result of a chi-square test. */
export interface ChiSquareResults {
  col_a: string
  col_b: string
  n: number
  chi_square: { statistic: number; p_value: string; dof: number; significant: boolean }
  fisher: { odds_ratio: number; p_value: string; significant: boolean } | null
  assumption_warning: string | null
  interpretation: string
}

/** Result of a dose-response curve fit. */
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

/** Single point on a Kaplan-Meier survival curve. */
export interface SurvivalPoint {
  time: number
  survival: number
}

/** Result of Kaplan-Meier survival analysis. */
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