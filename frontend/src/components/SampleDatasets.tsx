/**
 * SampleDatasets — clickable demo-mode cards shown below the upload zone.
 * Each card fetches a bundled CSV from /samples/, converts it to a File object,
 * and calls uploadCSV exactly as the UploadZone does — no special backend logic.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import { uploadCSV } from "../services/api"
import type { UploadResponse } from "../types"

interface Props {
  onUpload: (data: UploadResponse) => void
}

interface SampleMeta {
  id: string
  filename: string
  title: string
  description: string
  tags: string[]
  icon: string
  highlight: string   // accent colour tint for the icon bg
}

const SAMPLES: SampleMeta[] = [
  {
    id: "clinical",
    filename: "clinical_trial.csv",
    title: "Clinical Trial",
    description: "Blood-pressure drug vs placebo in 80 patients. Compare groups, test response rates.",
    tags: ["t-test", "Chi-square", "Descriptive"],
    icon: "💊",
    highlight: "rgba(45,212,191,0.12)",
  },
  {
    id: "dose",
    filename: "dose_response.csv",
    title: "Dose-Response / IC50",
    description: "Cell viability across 11 compound concentrations (4 replicates). Fit a 4PL curve.",
    tags: ["Dose-Response", "IC50"],
    icon: "🧪",
    highlight: "rgba(99,102,241,0.12)",
  },
  {
    id: "survival",
    filename: "survival_study.csv",
    title: "Cancer Survival Study",
    description: "Immunotherapy vs chemotherapy in 90 patients. Estimate & compare survival curves.",
    tags: ["Kaplan-Meier", "Log-rank test"],
    icon: "📈",
    highlight: "rgba(251,146,60,0.12)",
  },
  {
    id: "diet",
    filename: "diet_study.csv",
    title: "Diet Intervention",
    description: "Cholesterol & weight changes across 4 diet groups in 100 participants.",
    tags: ["ANOVA", "Correlation", "Regression"],
    icon: "🥗",
    highlight: "rgba(52,211,153,0.12)",
  },
]

export default function SampleDatasets({ onUpload }: Props) {
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
      onUpload(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sample")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ marginTop: 28 }}>
      {/* Header */}
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

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10,
      }}>
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
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"
              }}
            >
              {/* Top row: icon + loading spinner */}
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

              {/* Title */}
              <p style={{
                color: "var(--text)", fontWeight: 600,
                fontSize: 12.5, margin: "0 0 4px",
                fontFamily: "var(--font-sans)",
              }}>
                {sample.title}
              </p>

              {/* Description */}
              <p style={{
                color: "var(--text-muted)", fontSize: 11,
                lineHeight: 1.55, margin: "0 0 10px",
              }}>
                {sample.description}
              </p>

              {/* Tags */}
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