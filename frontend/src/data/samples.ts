export type SampleId = "clinical" | "dose" | "survival" | "diet"

export interface SampleConfig {
  test: string
  context: string
  columns?: string[]
  group_col?: string
  value_col?: string
  col_a?: string
  col_b?: string
  time_col?: string
  event_col?: string
  group_col_optional?: string
}

export interface SampleMeta {
  id: SampleId
  filename: string
  title: string
  description: string
  tags: string[]
  icon: string
  accent: string
  hero: string
  config: SampleConfig
  schemaHint: { label: string; type: "numeric" | "categorical" | "boolean" }[]
}

export const SAMPLES: SampleMeta[] = [
  {
    id: "clinical",
    filename: "clinical_trial.csv",
    title: "Clinical Trial",
    description: "Blood-pressure drug vs placebo in 80 patients.",
    tags: ["t-test", "Chi-square", "Descriptive"],
    icon: "💊",
    accent: "rgba(45,212,191,0.12)",
    hero: "Independent t-test / Mann-Whitney U",
    config: {
      test: "Independent t-test / Mann-Whitney U",
      context: "Comparing blood pressure reduction (mmHg) between Drug A and Placebo across 80 patients.",
      group_col: "treatment",
      value_col: "bp_reduction_mmhg",
    },
    schemaHint: [
      { label: "treatment", type: "categorical" },
      { label: "bp_reduction_mmhg", type: "numeric" },
      { label: "responded", type: "boolean" },
    ],
  },
  {
    id: "dose",
    filename: "dose_response.csv",
    title: "Dose-Response / IC50",
    description: "Cell viability across 11 concentrations with replicates.",
    tags: ["Dose-Response", "IC50"],
    icon: "🧪",
    accent: "rgba(99,102,241,0.12)",
    hero: "Dose-Response / IC50 Curve",
    config: {
      test: "Dose-Response / IC50 Curve",
      context: "Fitting a 4-parameter logistic curve to estimate IC50 from cell viability data.",
      col_a: "concentration_uM",
      col_b: "cell_viability_pct",
    },
    schemaHint: [
      { label: "concentration_uM", type: "numeric" },
      { label: "cell_viability_pct", type: "numeric" },
    ],
  },
  {
    id: "survival",
    filename: "survival_study.csv",
    title: "Cancer Survival Study",
    description: "Immunotherapy vs chemotherapy outcomes (time-to-event).",
    tags: ["Kaplan-Meier", "Log-rank"],
    icon: "📈",
    accent: "rgba(251,146,60,0.12)",
    hero: "Kaplan-Meier Survival Analysis",
    config: {
      test: "Kaplan-Meier Survival Analysis",
      context: "Comparing survival probability over time between Immunotherapy and Chemotherapy groups.",
      time_col: "time_days",
      event_col: "event",
      group_col_optional: "treatment",
    },
    schemaHint: [
      { label: "time_days", type: "numeric" },
      { label: "event", type: "boolean" },
      { label: "treatment", type: "categorical" },
    ],
  },
  {
    id: "diet",
    filename: "diet_study.csv",
    title: "Diet Intervention",
    description: "Cholesterol changes across 4 diet groups.",
    tags: ["ANOVA", "Correlation"],
    icon: "🥗",
    accent: "rgba(52,211,153,0.12)",
    hero: "One-Way ANOVA",
    config: {
      test: "One-Way ANOVA",
      context: "Comparing cholesterol reduction across multiple diet groups.",
      group_col: "diet_group",
      value_col: "cholesterol_change_mgdl",
    },
    schemaHint: [
      { label: "diet_group", type: "categorical" },
      { label: "cholesterol_change_mgdl", type: "numeric" },
    ],
  },
]