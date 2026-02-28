/**
 * SamplesPage — fully self-contained demo at "/samples".
 * Uploads the CSV, runs the pre-configured analysis, and shows results
 * inline. Zero column choices. Zero redirects.
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import TwoGroupResults from "../components/TwoGroupResults.tsx"
import AnovaResults from "../components/AnovaResults.tsx"
import DoseResponseResults from "../components/DoseResponseResults.tsx"
import KaplanMeierResults from "../components/KaplanMeierResults.tsx"
import {
  uploadCSV,
  runTwoGroup,
  runAnova,
  runDoseResponse,
  runKaplanMeier,
} from "../services/api"
import type {
  TwoGroupResults as TwoGroupRes,
  AnovaResults as AnovaRes,
  DoseResponseResults as DoseRes,
  KaplanMeierResults as KMRes,
} from "../types"

const NAV_H = 52

// ── SVG icons (Heroicons outline) ────────────────────────────────
function IconBeaker() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M9 3v8L5.5 17A2 2 0 0 0 7.4 20h9.2a2 2 0 0 0 1.9-3L15 11V3"/>
      <path d="M7 16h10"/>
    </svg>
  )
}
function IconTrendingUp() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}
function IconActivity() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
function IconPlay() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────
type SampleResult =
  | { type: "two-group";     data: TwoGroupRes }
  | { type: "anova";         data: AnovaRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier";  data: KMRes }

interface SampleMeta {
  id: string
  filename: string
  title: string
  question: string           // plain-English framing question
  story: string              // one-sentence dataset description
  what: string               // what the analysis answers
  rows: number
  cols: string[]             // key columns shown as chips
  icon: React.ReactNode
  accent: string
  accentText: string
  tags: string[]
  run: (sessionId: string) => Promise<SampleResult>
}

// ── Sample definitions ────────────────────────────────────────────
const SAMPLES: SampleMeta[] = [
  {
    id: "clinical",
    filename: "clinical_trial.csv",
    title: "Clinical Trial",
    question: "Does the drug lower blood pressure more than placebo?",
    story: "80 patients were randomised to Drug A or placebo. Blood pressure was measured before and after treatment.",
    what: "An independent t-test compares the mean BP reduction between the two groups and tells you whether the difference is statistically significant.",
    rows: 80,
    cols: ["treatment", "bp_reduction_mmhg"],
    icon: <IconActivity />,
    accent: "rgba(45,212,191,0.12)",
    accentText: "#2dd4bf",
    tags: ["t-test", "Mann-Whitney U"],
    run: async (sid) => {
      const data = await runTwoGroup(sid, "treatment", "bp_reduction_mmhg")
      return { type: "two-group", data }
    },
  },
  {
    id: "dose",
    filename: "dose_response.csv",
    title: "Dose-Response / IC50",
    question: "At what concentration does the compound kill half the cells?",
    story: "Cell viability was measured at 11 compound concentrations with 4 replicates each — a standard pharmacology assay.",
    what: "A 4-parameter logistic (4PL) curve is fitted to the data. The IC50 is the concentration at which viability drops to 50% — a key potency metric.",
    rows: 44,
    cols: ["concentration_uM", "cell_viability_pct"],
    icon: <IconBeaker />,
    accent: "rgba(99,102,241,0.12)",
    accentText: "#818cf8",
    tags: ["4PL curve", "IC50"],
    run: async (sid) => {
      const data = await runDoseResponse(sid, "concentration_uM", "cell_viability_pct")
      return { type: "dose-response", data }
    },
  },
  {
    id: "survival",
    filename: "survival_study.csv",
    title: "Cancer Survival Study",
    question: "Does immunotherapy improve survival compared to chemotherapy?",
    story: "90 cancer patients were followed for up to 2 years. Some were censored (lost to follow-up or study ended before their event).",
    what: "Kaplan-Meier curves estimate survival probability over time for each group. The log-rank test checks whether the curves are statistically different.",
    rows: 90,
    cols: ["time_days", "event", "treatment"],
    icon: <IconTrendingUp />,
    accent: "rgba(251,146,60,0.12)",
    accentText: "#fb923c",
    tags: ["Kaplan-Meier", "Log-rank test"],
    run: async (sid) => {
      const data = await runKaplanMeier(sid, "time_days", "event", "treatment")
      return { type: "kaplan-meier", data }
    },
  },
  {
    id: "diet",
    filename: "diet_study.csv",
    title: "Diet Intervention",
    question: "Which diet produces the greatest cholesterol reduction?",
    story: "100 participants followed one of four diets (Mediterranean, Vegan, Low-Carb, or Standard) for 12 weeks.",
    what: "One-way ANOVA tests whether mean cholesterol change differs significantly across the four diet groups. Kruskal-Wallis is run as a non-parametric alternative.",
    rows: 100,
    cols: ["diet_group", "cholesterol_change_mgdl"],
    icon: <IconUsers />,
    accent: "rgba(52,211,153,0.12)",
    accentText: "#34d399",
    tags: ["ANOVA", "Kruskal-Wallis"],
    run: async (sid) => {
      const data = await runAnova(sid, "diet_group", "cholesterol_change_mgdl")
      return { type: "anova", data }
    },
  },
]

// ── Component ─────────────────────────────────────────────────────
export default function SamplesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<SampleResult | null>(null)
  const [error, setError] = useState("")
  const [view, setView] = useState<"results" | "data">("results")
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [previewRows, setPreviewRows] = useState<string[][]>([])

  const activeSample = SAMPLES.find(s => s.id === selected) ?? null

  const runSample = async (sample: SampleMeta) => {
    // If already selected and has result, don't re-run
    if (selected === sample.id && result) return
    setSelected(sample.id)
    setResult(null)
    setError("")
    setView("results")
    setLoading(sample.id)
    try {
      const res = await fetch(`/samples/${sample.filename}`)
      if (!res.ok) throw new Error("Could not load sample file")
      const blob = await res.blob()
      const file = new File([blob], sample.filename, { type: "text/csv" })

      // Parse first 8 rows for the data inspector
      const text = await blob.text()
      const lines = text.trim().split("\n").filter(Boolean)
      const parse = (line: string) =>
        line.split(",").map(cell => cell.replace(/^"|"$/g, "").trim())
      setPreviewHeaders(parse(lines[0] ?? ""))
      setPreviewRows(lines.slice(1, 9).map(parse))
      const uploaded = await uploadCSV(file)
      const analysisResult = await sample.run(uploaded.session_id)
      setResult(analysisResult)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(null)
    }
  }

  const renderResult = () => {
    if (!result) return null
    // Pass a no-op onBack — there's no "back" on this page
    const noop = () => {}
    switch (result.type) {
      case "two-group":     return <TwoGroupResults results={result.data} onBack={noop} />
      case "anova":         return <AnovaResults results={result.data} onBack={noop} />
      case "dose-response": return <DoseResponseResults results={result.data} onBack={noop} />
      case "kaplan-meier":  return <KaplanMeierResults results={result.data} onBack={noop} />
    }
  }

  return (
    <>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: `${NAV_H + 48}px 32px 80px`,
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 32,
        alignItems: "start",
      }}>

        {/* ── Left: header + sample cards ─────────────────────── */}
        <div>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const,
            marginBottom: 10,
          }}>
            Demo datasets
          </p>
          <h1 style={{
            color: "var(--text)", fontWeight: 700, fontSize: 24,
            margin: "0 0 8px", letterSpacing: "-0.3px",
          }}>
            Samples
          </h1>
          <p style={{
            color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6, margin: "0 0 28px",
          }}>
            Click a dataset to run the analysis instantly. No setup required.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SAMPLES.map(sample => {
              const isSelected = selected === sample.id
              const isLoading = loading === sample.id
              return (
                <motion.button
                  key={sample.id}
                  onClick={() => runSample(sample)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    opacity: loading && !isLoading ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: sample.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: sample.accentText,
                    }}>
                      {isLoading ? (
                        <div style={{
                          width: 14, height: 14,
                          border: "2px solid var(--accent)",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }} />
                      ) : sample.icon}
                    </div>
                    <span style={{
                      color: isSelected ? "var(--accent-text)" : "var(--text)",
                      fontWeight: 600, fontSize: 13,
                    }}>
                      {sample.title}
                    </span>
                  </div>

                  <p style={{
                    color: "var(--text-muted)", fontSize: 11,
                    lineHeight: 1.5, margin: "0 0 8px 42px",
                  }}>
                    {sample.question}
                  </p>

                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginLeft: 42 }}>
                    {sample.tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: "var(--font-mono)", fontSize: 9,
                        color: "var(--text-muted)", background: "var(--bg-alt)",
                        borderRadius: 4, padding: "2px 6px",
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
        </div>

        {/* ── Right: results panel ─────────────────────────────── */}
        <div style={{ minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {!selected && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  height: 400,
                  border: "1px dashed var(--border)",
                  borderRadius: 16,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 12,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)",
                }}>
                  <IconPlay />
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
                  Select a dataset to run the demo
                </p>
              </motion.div>
            )}

            {selected && loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  height: 400,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 14,
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  border: "2px solid var(--accent)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, fontFamily: "var(--font-mono)" }}>
                  Uploading & analysing…
                </p>
              </motion.div>
            )}

            {selected && !loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  padding: "16px 20px", borderRadius: 12,
                  border: "1px solid #7f1d1d", background: "#450a0a",
                  color: "#fca5a5", fontSize: 13,
                }}
              >
                {error}
              </motion.div>
            )}

            {selected && !loading && result && activeSample && (
              <motion.div
                key={`result-${selected}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tab bar */}
                <div style={{
                  display: "flex", gap: 4, marginBottom: 16,
                  borderBottom: "1px solid var(--border)", paddingBottom: 0,
                }}>
                  {(["results", "data"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setView(tab)}
                      style={{
                        padding: "7px 16px",
                        background: "none", border: "none",
                        borderBottom: view === tab ? "2px solid var(--accent)" : "2px solid transparent",
                        marginBottom: -1,
                        color: view === tab ? "var(--accent-text)" : "var(--text-muted)",
                        fontWeight: view === tab ? 600 : 400,
                        fontSize: 12, cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        transition: "all 0.15s",
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {tab === "results" ? "Results" : "Inspect data"}
                    </button>
                  ))}
                </div>
                {view === "results" && (
                <>            
                {/* Dataset header */}
                <div style={{
                  padding: "18px 22px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p style={{
                        color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                        fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const,
                        margin: "0 0 6px",
                      }}>
                        {activeSample.title}
                      </p>
                      <h2 style={{
                        color: "var(--text)", fontWeight: 700, fontSize: 16,
                        margin: "0 0 8px", letterSpacing: "-0.2px",
                      }}>
                        {activeSample.question}
                      </h2>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px" }}>
                        {activeSample.story}
                      </p>
                    </div>
                  </div>

                  {/* Dataset chips */}
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: "var(--text-muted)", background: "var(--bg-alt)",
                      border: "1px solid var(--border)", borderRadius: 5, padding: "3px 8px",
                    }}>
                      {activeSample.rows} rows
                    </span>
                    {activeSample.cols.map(col => (
                      <span key={col} style={{
                        fontFamily: "var(--font-mono)", fontSize: 10,
                        color: "var(--accent-text)", background: "var(--accent-dim)",
                        border: "1px solid rgba(45,212,191,0.15)", borderRadius: 5, padding: "3px 8px",
                      }}>
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                {/* What does this analysis do? */}
                <div style={{
                  padding: "12px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid var(--accent)`,
                  borderRadius: "0 8px 8px 0",
                  marginBottom: 20,
                }}>
                  <p style={{
                    color: "var(--text-muted)", fontFamily: "var(--font-mono)",
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const,
                    margin: "0 0 5px",
                  }}>
                    What the analysis does
                  </p>
                  <p style={{ color: "var(--text)", fontSize: 12, lineHeight: 1.65, margin: 0 }}>
                    {activeSample.what}
                  </p>
                </div>

                {/* Results */}
                {renderResult()}

                {/* Open in full app */}
                <div style={{
                  marginTop: 24,
                  padding: "16px 20px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: "0 0 3px" }}>
                      Want to explore further?
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>
                      Load this dataset in the full app to try other analyses, change columns, and export results.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/app")}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 18px", borderRadius: 8,
                      background: "var(--accent)", color: "#000",
                      border: "none", cursor: "pointer",
                      fontWeight: 700, fontSize: 12,
                      fontFamily: "var(--font-sans)",
                      flexShrink: 0, marginLeft: 20,
                    }}
                  >
                    Open App
                    <IconArrowRight />
                  </button>
                </div>
                </>
                )}

                {view === "data" && (
                <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: "var(--surface)" }}>
                        {previewHeaders.map(h => (
                          <th key={h} style={{
                            padding: "9px 14px", textAlign: "left",
                            color: "var(--accent-text)", fontFamily: "var(--font-mono)",
                            fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                            borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" as const,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                          {row.map((cell, j) => (
                            <td key={j} style={{
                              padding: "8px 14px",
                              color: "var(--text)", fontFamily: "var(--font-mono)",
                              fontSize: 11, whiteSpace: "nowrap" as const,
                            }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{
                    padding: "8px 14px", borderTop: "1px solid var(--border)",
                    color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)",
                  }}>
                    Showing first {previewRows.length} of {activeSample.rows} rows
                  </div>
                </div>
              )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {t("landing.footer")}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            FastAPI · React · Redis
          </span>
        </div>
      </footer>
    </>
  )
}