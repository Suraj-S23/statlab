/**
 * SampleDatasets — clickable demo cards that load a pre-configured analysis.
 * Each sample has a "hero" analysis with columns pre-selected, so clicking a
 * card skips the suggestion panel and goes straight to results.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { uploadCSV } from "../services/api"
import type { UploadResponse } from "../types"

export interface SampleConfig {
  test: string
  context: string       // shown as a banner above results
  columns?: string[]                // descriptive
  group_col?: string                // t-test, anova
  value_col?: string                // t-test, anova
  col_a?: string                    // correlation, regression, chi-square, dose-response
  col_b?: string                    // correlation, regression, chi-square, dose-response
  time_col?: string                 // kaplan-meier
  event_col?: string                // kaplan-meier
  group_col_optional?: string       // kaplan-meier optional stratification
}

interface SampleMeta {
  id: string
  filename: string
  title: string
  description: string
  tags: string[]
  icon: string
  highlight: string
  config: SampleConfig
}

const SAMPLES: SampleMeta[] = [
  {
    id: "clinical",
    filename: "clinical_trial.csv",
    title: "Clinical Trial",
    description: "Blood-pressure drug vs placebo in 80 patients.",
    tags: ["t-test", "Chi-square", "Descriptive"],
    icon: "💊",
    highlight: "rgba(45,212,191,0.12)",
    config: {
      test: "Independent t-test / Mann-Whitney U",
      context: "Comparing blood pressure reduction (mmHg) between Drug A and Placebo across 80 patients.",
      group_col: "treatment",
      value_col: "bp_reduction_mmhg",
    },
  },
  {
    id: "dose",
    filename: "dose_response.csv",
    title: "Dose-Response / IC50",
    description: "Cell viability across 11 concentrations with 4 replicates each.",
    tags: ["Dose-Response", "IC50"],
    icon: "🧪",
    highlight: "rgba(99,102,241,0.12)",
    config: {
      test: "Dose-Response / IC50 Curve",
      context: "Fitting a 4-parameter logistic curve to estimate IC50 from cell viability data.",
      col_a: "concentration_uM",
      col_b: "cell_viability_pct",
    },
  },
  {
    id: "survival",
    filename: "survival_study.csv",
    title: "Cancer Survival Study",
    description: "Immunotherapy vs chemotherapy outcomes in 90 patients.",
    tags: ["Kaplan-Meier", "Log-rank"],
    icon: "📈",
    highlight: "rgba(251,146,60,0.12)",
    config: {
      test: "Kaplan-Meier Survival Analysis",
      context: "Comparing survival probability over time between Immunotherapy and Chemotherapy groups.",
      time_col: "time_days",
      event_col: "event",
      group_col_optional: "treatment",
    },
  },
  {
    id: "diet",
    filename: "diet_study.csv",
    title: "Diet Intervention",
    description: "Cholesterol & weight changes across 4 diet groups, 100 participants.",
    tags: ["ANOVA", "Correlation"],
    icon: "🥗",
    highlight: "rgba(52,211,153,0.12)",
    config: {
      test: "One-Way ANOVA",
      context: "Comparing cholesterol reduction across Mediterranean, Vegan, Low-Carb, and Standard diets.",
      group_col: "diet_group",
      value_col: "cholesterol_change_mgdl",
    },
  },
]

interface Props {
  onSampleUpload: (data: UploadResponse, config: SampleConfig) => void
}

export default function SampleDatasets({ onSampleUpload }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadSample = async (sample: SampleMeta) => {
    setLoading(sample.id)
    setError("")
    try {
      const res = await fetch(`/samples/${sample.filename}`)
      if (!res.ok) throw new Error("Could not load sample file")
      const blob = await res.blob()
      const file = new File([blob], sample.filename, { type: "text/csv" })
      const data = await uploadCSV(file)
      onSampleUpload(data, sample.config)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sample")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          color: "var(--text-muted)", letterSpacing: "0.14em",
          textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          or try a sample dataset
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {SAMPLES.map((sample) => {
          const isLoading = loading === sample.id
          return (
            <motion.button
              key={sample.id}
              onClick={() => !loading && loadSample(sample)}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              disabled={!!loading}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 16px",
                cursor: loading ? "default" : "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, background 0.15s",
                opacity: loading && !isLoading ? 0.45 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: sample.highlight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {isLoading ? (
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid var(--accent)",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                  ) : sample.icon}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--accent-text)", letterSpacing: "0.05em",
                  background: "var(--accent-dim)", borderRadius: 5,
                  padding: "2px 7px", marginTop: 2,
                }}>
                  {isLoading ? "Loading…" : "Try it →"}
                </span>
              </div>

              <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 12.5, margin: "0 0 4px" }}>
                {sample.title}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.55, margin: "0 0 10px" }}>
                {sample.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {sample.tags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "var(--text-muted)", background: "var(--bg-alt)",
                    borderRadius: 4, padding: "2px 7px",
                    border: "1px solid var(--border)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: "#f87171", fontSize: 11, marginTop: 8, textAlign: "center" }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}