/**
 * AppPage — analysis workspace at "/app"
 * Adds: robust stage machine + demo mode from /app?sample=...&mode=demo
 */

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

import UploadZone from "../components/UploadZone"
import DataPreview from "../components/DataPreview"
import SuggestionPanel from "../components/SuggestionPanel"
import ColumnSelector from "../components/ColumnSelector"
import TwoGroupSelector from "../components/TwoGroupSelector"
import TwoNumericSelector from "../components/TwoNumericSelector"
import KaplanMeierSelector from "../components/KaplanMeierSelector"
import SampleDatasets from "../components/SampleDatasets"

import DescriptiveResults from "../components/DescriptiveResults"
import TwoGroupResults from "../components/TwoGroupResults"
import AnovaResults from "../components/AnovaResults"
import CorrelationResults from "../components/CorrelationResults"
import RegressionResults from "../components/RegressionResults"
import ChiSquareResults from "../components/ChiSquareResults"
import DoseResponseResults from "../components/DoseResponseResults"
import KaplanMeierResults from "../components/KaplanMeierResults"

import {
  runDescriptive, runTwoGroup, runAnova, runCorrelation,
  runRegression, runChiSquare, runDoseResponse, runKaplanMeier,
} from "../services/api"

import type {
  UploadResponse,
  DescriptiveResults as DescResults,
  TwoGroupResults as TwoResults,
  AnovaResults as AnovaRes,
  CorrelationResults as CorrRes,
  RegressionResults as RegRes,
  ChiSquareResults as ChiRes,
  DoseResponseResults as DoseRes,
  KaplanMeierResults as KMRes,
} from "../types"

import { SAMPLES, type SampleConfig, type SampleId } from "../data/samples"

type AnyResults =
  | { type: "descriptive"; data: DescResults }
  | { type: "two-group"; data: TwoResults }
  | { type: "anova"; data: AnovaRes }
  | { type: "correlation"; data: CorrRes }
  | { type: "regression"; data: RegRes }
  | { type: "chi-square"; data: ChiRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier"; data: KMRes }

type Stage = "upload" | "suggest" | "configure" | "results"

const NAV_H = 52

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function AppPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const sampleId = params.get("sample") as SampleId | null
  const mode = params.get("mode") // "demo" | null

  const [stage, setStage] = useState<Stage>("upload")
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [results, setResults] = useState<AnyResults | null>(null)

  // Persist user selections so back/forward does not “lose” a previously valid config
  const [lastSelection, setLastSelection] = useState<Record<string, unknown>>({})

  // Demo mode state
  const [demoConfig, setDemoConfig] = useState<SampleConfig | null>(null)
  const [demoLocked, setDemoLocked] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isDemo = mode === "demo" && !!sampleId

  const activeSample = useMemo(() => {
    if (!sampleId) return null
    return SAMPLES.find(s => s.id === sampleId) ?? null
  }, [sampleId])

  async function runAnalysis<T>(fn: () => Promise<T>, type: AnyResults["type"]) {
    setLoading(true)
    setError("")
    try {
      const result = await fn()
      setResults({ type, data: result } as AnyResults)
      setStage("results")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("common.analysisFailed", "Analysis failed"))
    } finally {
      setLoading(false)
    }
  }

  const handleResetAll = () => {
    setData(null)
    setSelectedTest(null)
    setResults(null)
    setError("")
    setStage("upload")
    setDemoConfig(null)
    setDemoLocked(true)
    setLastSelection({})
    params.delete("sample")
    params.delete("mode")
    setParams(params, { replace: true })
  }

  const handleBack = () => {
    setError("")
    setResults(null)
    // In demo mode, go back to configure (not to a freeform suggestion panel)
    setStage(isDemo ? "configure" : "suggest")
  }

  const handleUpload = (uploaded: UploadResponse) => {
    setData(uploaded)
    setStage("suggest")
    setSelectedTest(null)
    setResults(null)
    setError("")
  }

  // ✅ Correct prop for SampleDatasets
  const handleSampleUpload = (uploaded: UploadResponse, config: SampleConfig) => {
    setData(uploaded)
    setDemoConfig(config)
    setSelectedTest(config.test)
    setStage("configure")
    setResults(null)
    setError("")
    setDemoLocked(true)
  }

  // If user came from /samples Open demo → auto-load that sample
  useEffect(() => {
    if (!isDemo || !activeSample) return
    // Load sample by fetching /samples/<filename> exactly like SampleDatasets does
    let cancelled = false

    async function loadDemo() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/samples/${activeSample.filename}`)
        if (!res.ok) throw new Error("Could not load sample file")
        const blob = await res.blob()
        const file = new File([blob], activeSample.filename, { type: "text/csv" })

        // reuse your existing uploadCSV in api layer by dynamic import to avoid circular deps
        const api = await import("../services/api")
        const uploaded = await api.uploadCSV(file)

        if (cancelled) return
        handleSampleUpload(uploaded, activeSample.config)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load sample")
        setStage("upload")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // only load if we don't already have data
    if (!data) loadDemo()
    return () => { cancelled = true }
  }, [isDemo, activeSample, data])

  // Demo mode: auto-run the “hero” analysis once the demo is configured
  useEffect(() => {
    if (!isDemo) return
    if (!data || !demoConfig) return
    if (results) return // already ran
    if (stage !== "configure") return

    async function autoRun() {
      const sid = data.session_id
      const test = demoConfig.test

      if (test === "Independent t-test / Mann-Whitney U" && demoConfig.group_col && demoConfig.value_col) {
        await runAnalysis(() => runTwoGroup(sid, demoConfig.group_col!, demoConfig.value_col!), "two-group")
      } else if (test === "One-Way ANOVA" && demoConfig.group_col && demoConfig.value_col) {
        await runAnalysis(() => runAnova(sid, demoConfig.group_col!, demoConfig.value_col!), "anova")
      } else if (test === "Dose-Response / IC50 Curve" && demoConfig.col_a && demoConfig.col_b) {
        await runAnalysis(() => runDoseResponse(sid, demoConfig.col_a!, demoConfig.col_b!), "dose-response")
      } else if (test === "Kaplan-Meier Survival Analysis" && demoConfig.time_col && demoConfig.event_col) {
        await runAnalysis(
          () => runKaplanMeier(sid, demoConfig.time_col!, demoConfig.event_col!, demoConfig.group_col_optional ?? null),
          "kaplan-meier"
        )
      }
    }

    autoRun()
  }, [isDemo, data, demoConfig, stage, results])

  const renderResults = () => {
    if (!results) return null
    const props = { onBack: handleBack }
    switch (results.type) {
      case "descriptive": return <DescriptiveResults results={results.data} {...props} />
      case "two-group": return <TwoGroupResults results={results.data} {...props} />
      case "anova": return <AnovaResults results={results.data} {...props} />
      case "correlation": return <CorrelationResults results={results.data} {...props} />
      case "regression": return <RegressionResults results={results.data} {...props} />
      case "chi-square": return <ChiSquareResults results={results.data} {...props} />
      case "dose-response": return <DoseResponseResults results={results.data} {...props} />
      case "kaplan-meier": return <KaplanMeierResults results={results.data} {...props} />
    }
  }

  const renderConfigure = () => {
    if (!data) return null
    if (loading) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 48 }}>
          <div style={{
            width: 28, height: 28, border: "2px solid var(--accent)",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("common.runningAnalysis")}</p>
        </div>
      )
    }

    // DEMO LOCK: show a small banner + allow switching to explore mode
    const DemoBanner = isDemo && demoConfig ? (
      <div style={{
        marginBottom: 14,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(45,212,191,0.25)",
        background: "rgba(45,212,191,0.08)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Demo mode
          </div>
          <div style={{ marginTop: 4, color: "var(--text)" }}>
            {demoConfig.context}
          </div>
        </div>
        <button
          onClick={() => setDemoLocked(v => !v)}
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            cursor: "pointer",
            color: "var(--text)",
            fontSize: 12,
            fontWeight: 650,
            whiteSpace: "nowrap",
          }}
        >
          {demoLocked ? "Switch to Explore" : "Lock demo"}
        </button>
      </div>
    ) : null

    // If demo is locked, do NOT allow changing columns — we only show the results path.
    if (isDemo && demoConfig && demoLocked) {
      return (
        <div>
          {DemoBanner}
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Demo is locked to the recommended configuration. Click “Switch to Explore” to change columns.
          </div>
        </div>
      )
    }

    // Otherwise: normal flow
    switch (selectedTest) {
      case "Descriptive Statistics":
        return (
          <div>
            {DemoBanner}
            <ColumnSelector
              columns={data.columns}
              filterType="numeric"
              minSelect={1}
              onConfirm={(cols) => {
                setLastSelection({ descriptiveCols: cols })
                runAnalysis(() => runDescriptive(data.session_id, cols), "descriptive")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Independent t-test / Mann-Whitney U":
        return (
          <div>
            {DemoBanner}
            <TwoGroupSelector
              columns={data.columns}
              onConfirm={(g, v) => {
                setLastSelection({ groupCol: g, valueCol: v })
                runAnalysis(() => runTwoGroup(data.session_id, g, v), "two-group")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "One-Way ANOVA":
        return (
          <div>
            {DemoBanner}
            <TwoGroupSelector
              columns={data.columns}
              onConfirm={(g, v) => {
                setLastSelection({ groupCol: g, valueCol: v })
                runAnalysis(() => runAnova(data.session_id, g, v), "anova")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Correlation (Pearson / Spearman)":
        return (
          <div>
            {DemoBanner}
            <TwoNumericSelector
              columns={data.columns}
              labelA="First column"
              labelB="Second column"
              onConfirm={(a, b) => {
                setLastSelection({ colA: a, colB: b })
                runAnalysis(() => runCorrelation(data.session_id, a, b), "correlation")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Simple Linear Regression":
        return (
          <div>
            {DemoBanner}
            <TwoNumericSelector
              columns={data.columns}
              labelA="Predictor column (X)"
              labelB="Outcome column (Y)"
              onConfirm={(a, b) => {
                setLastSelection({ colA: a, colB: b })
                runAnalysis(() => runRegression(data.session_id, a, b), "regression")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Chi-Square / Fisher's Exact Test":
        return (
          <div>
            {DemoBanner}
            <ColumnSelector
              columns={data.columns}
              filterType="categorical"
              minSelect={2}
              maxSelect={2}
              onConfirm={(cols) => {
                setLastSelection({ colA: cols[0], colB: cols[1] })
                runAnalysis(() => runChiSquare(data.session_id, cols[0], cols[1]), "chi-square")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Dose-Response / IC50 Curve":
        return (
          <div>
            {DemoBanner}
            <TwoNumericSelector
              columns={data.columns}
              labelA="Concentration column"
              labelB="Response column"
              onConfirm={(a, b) => {
                setLastSelection({ colA: a, colB: b })
                runAnalysis(() => runDoseResponse(data.session_id, a, b), "dose-response")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      case "Kaplan-Meier Survival Analysis":
        return (
          <div>
            {DemoBanner}
            <KaplanMeierSelector
              columns={data.columns}
              onConfirm={(timeCol, eventCol, groupCol) => {
                setLastSelection({ timeCol, eventCol, groupCol })
                runAnalysis(() => runKaplanMeier(data.session_id, timeCol, eventCol, groupCol), "kaplan-meier")
              }}
              onBack={() => setStage(isDemo ? "configure" : "suggest")}
            />
          </div>
        )

      default:
        return (
          <div>
            {DemoBanner}
            <SuggestionPanel
              data={data}
              onSelectTest={(tname) => {
                setSelectedTest(tname)
                setStage("configure")
              }}
            />
          </div>
        )
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        {/* Upload stage */}
        {stage === "upload" && (
          <div style={{
            maxWidth: 1400, margin: "0 auto",
            padding: `${NAV_H + 48}px 32px 80px`,
            display: "grid", gridTemplateColumns: "480px 1fr", gap: 48, alignItems: "start",
          }}>
            <div>
              <UploadZone onUpload={handleUpload} />
              <SampleDatasets onSampleUpload={handleSampleUpload} />
            </div>

            <div style={{ paddingTop: 8 }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
                letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14,
              }}>
                Available analyses
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {(["descriptive", "ttest", "anova", "correlation", "regression", "chi", "dose", "km"] as const).map(k => (
                  <span key={k} style={{
                    fontSize: 11, color: "var(--text-muted)", background: "var(--surface)",
                    border: "1px solid var(--border)", padding: "6px 12px",
                    borderRadius: 10, fontFamily: "var(--font-mono)",
                  }}>
                    {t(`landing.pills.${k}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggest / Configure / Results */}
        {stage !== "upload" && data && (
          <div>
            {/* fixed file bar */}
            <div style={{
              position: "fixed", top: NAV_H, left: 0, right: 0, zIndex: 40,
              background: "var(--nav-bg)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                maxWidth: 1400, margin: "0 auto", padding: "0 32px",
                height: 36, display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  {data.filename} · {data.rows.toLocaleString()} {t("nav.rows")}
                </span>
                <button
                  onClick={handleResetAll}
                  style={{
                    fontSize: 11, color: "var(--text-muted)", background: "none",
                    border: "1px solid var(--border)", borderRadius: 8,
                    padding: "3px 10px", cursor: "pointer",
                  }}
                >
                  {t("nav.newFile")}
                </button>
              </div>
            </div>

            <main style={{ maxWidth: 1400, margin: "0 auto", padding: `${NAV_H + 36 + 24}px 32px 80px` }}>
              <DataPreview data={data} onReset={handleResetAll} />

              {error && (
                <div style={{
                  marginTop: 10, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid #7f1d1d", background: "#450a0a",
                  color: "#fca5a5", fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              {stage === "suggest" && !isDemo && (
                <SuggestionPanel
                  data={data}
                  onSelectTest={(tname) => {
                    setSelectedTest(tname)
                    setStage("configure")
                  }}
                />
              )}

              {stage === "configure" && renderConfigure()}
              {stage === "results" && renderResults()}
            </main>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}