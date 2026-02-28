/**
 * AppPage — the full analysis workspace, lives at "/app".
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import UploadZone from "../components/UploadZone.tsx"
import DataPreview from "../components/DataPreview.tsx"
import SuggestionPanel from "../components/SuggestionPanel.tsx"
import ColumnSelector from "../components/ColumnSelector.tsx"
import TwoGroupSelector from "../components/TwoGroupSelector.tsx"
import TwoNumericSelector from "../components/TwoNumericSelector.tsx"
import KaplanMeierSelector from "../components/KaplanMeierSelector.tsx"
import DescriptiveResults from "../components/DescriptiveResults.tsx"
import TwoGroupResults from "../components/TwoGroupResults.tsx"
import AnovaResults from "../components/AnovaResults.tsx"
import CorrelationResults from "../components/CorrelationResults.tsx"
import RegressionResults from "../components/RegressionResults.tsx"
import ChiSquareResults from "../components/ChiSquareResults.tsx"
import DoseResponseResults from "../components/DoseResponseResults.tsx"
import KaplanMeierResults from "../components/KaplanMeierResults.tsx"
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

type AnyResults =
  | { type: "descriptive"; data: DescResults }
  | { type: "two-group"; data: TwoResults }
  | { type: "anova"; data: AnovaRes }
  | { type: "correlation"; data: CorrRes }
  | { type: "regression"; data: RegRes }
  | { type: "chi-square"; data: ChiRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier"; data: KMRes }

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const NAV_H = 52

export default function AppPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [results, setResults] = useState<AnyResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function runAnalysis<T>(fn: () => Promise<T>, type: AnyResults["type"]) {
    setLoading(true)
    setError("")
    try {
      const result = await fn()
      setResults({ type, data: result } as AnyResults)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setData(null)
    setSelectedTest(null)
    setResults(null)
    setError("")
  }

  const handleBackToSuggestions = () => {
    setSelectedTest(null)
    setResults(null)
    setError("")
  }

  // Wrapper: SampleDatasets expects (data: UploadResponse) => void,
  // but setData accepts UploadResponse | null. Wrapping avoids the type mismatch.
  const handleUpload = (uploadedData: UploadResponse) => {
  setData(uploadedData)
}

  const renderResults = () => {
    if (!results) return null
    const props = { onBack: handleBackToSuggestions }
    switch (results.type) {
      case "descriptive":   return <DescriptiveResults results={results.data} {...props} />
      case "two-group":     return <TwoGroupResults results={results.data} {...props} />
      case "anova":         return <AnovaResults results={results.data} {...props} />
      case "correlation":   return <CorrelationResults results={results.data} {...props} />
      case "regression":    return <RegressionResults results={results.data} {...props} />
      case "chi-square":    return <ChiSquareResults results={results.data} {...props} />
      case "dose-response": return <DoseResponseResults results={results.data} {...props} />
      case "kaplan-meier":  return <KaplanMeierResults results={results.data} {...props} />
    }
  }

  const renderSelector = () => {
    if (!data) return null
    if (loading) return (
      <motion.div
        variants={pageVariants} initial="initial" animate="animate"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 48 }}
      >
        <div style={{
          width: 28, height: 28, border: "2px solid var(--accent)",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("common.runningAnalysis")}</p>
      </motion.div>
    )

    switch (selectedTest) {
      case "Descriptive Statistics":
        return <ColumnSelector columns={data.columns} filterType="numeric"
          onConfirm={(cols) => runAnalysis(() => runDescriptive(data.session_id, cols), "descriptive")}
          onBack={handleBackToSuggestions} minSelect={1} />

      case "Independent t-test / Mann-Whitney U":
        return <TwoGroupSelector columns={data.columns}
          onConfirm={(g, v) => runAnalysis(() => runTwoGroup(data.session_id, g, v), "two-group")}
          onBack={handleBackToSuggestions} />

      case "One-Way ANOVA":
        return <TwoGroupSelector columns={data.columns}
          onConfirm={(g, v) => runAnalysis(() => runAnova(data.session_id, g, v), "anova")}
          onBack={handleBackToSuggestions} />

      case "Correlation (Pearson / Spearman)":
        return <TwoNumericSelector columns={data.columns} labelA="First column" labelB="Second column"
          onConfirm={(a, b) => runAnalysis(() => runCorrelation(data.session_id, a, b), "correlation")}
          onBack={handleBackToSuggestions} />

      case "Simple Linear Regression":
        return <TwoNumericSelector columns={data.columns} labelA="Predictor column (X)" labelB="Outcome column (Y)"
          onConfirm={(a, b) => runAnalysis(() => runRegression(data.session_id, a, b), "regression")}
          onBack={handleBackToSuggestions} />

      case "Chi-Square / Fisher's Exact Test":
        return <ColumnSelector columns={data.columns} filterType="categorical"
          onConfirm={(cols) => runAnalysis(() => runChiSquare(data.session_id, cols[0], cols[1]), "chi-square")}
          onBack={handleBackToSuggestions} minSelect={2} maxSelect={2} />

      case "Dose-Response / IC50 Curve":
        return <TwoNumericSelector columns={data.columns} labelA="Concentration column" labelB="Response column"
          onConfirm={(a, b) => runAnalysis(() => runDoseResponse(data.session_id, a, b), "dose-response")}
          onBack={handleBackToSuggestions} />

      case "Kaplan-Meier Survival Analysis":
        return <KaplanMeierSelector columns={data.columns}
          onConfirm={(timeCol, eventCol, groupCol) => runAnalysis(() => runKaplanMeier(data.session_id, timeCol, eventCol, groupCol), "kaplan-meier")}
          onBack={handleBackToSuggestions} />

      default:
        return <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!data ? (
        /* ── Upload view ─────────────────────────────────────────────────── */
        <motion.div
          key="upload"
          variants={pageVariants} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.25 }}
        >
          <div style={{
            maxWidth: 1400, margin: "0 auto",
            padding: `${NAV_H + 48}px 32px 80px`,
            display: "grid", gridTemplateColumns: "480px 1fr", gap: 48, alignItems: "start",
          }}>
            <div>
              <UploadZone onUpload={handleUpload} />
              <button
                onClick={() => navigate("/samples")}
                style={{
                  marginTop: 20, width: "100%",
                  padding: "11px 0", borderRadius: 10,
                  border: "1px dashed var(--border)",
                  background: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: 12,
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)"
                  ;(e.currentTarget as HTMLButtonElement).style.color = "var(--accent-text)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"
                  ;(e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"
                }}
              >
                Try a sample dataset →
              </button>
            </div>

            <div style={{ paddingTop: 8 }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)",
                letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 14,
              }}>
                Available analyses
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {(["descriptive", "ttest", "anova", "correlation", "regression", "chi", "dose", "km"] as const).map(k => (
                  <span key={k} style={{
                    fontSize: 11, color: "var(--text-muted)", background: "var(--surface)",
                    border: "1px solid var(--border)", padding: "6px 12px",
                    borderRadius: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.03em",
                  }}>
                    {t(`landing.pills.${k}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>

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
        </motion.div>

      ) : (
        /* ── Workspace view ──────────────────────────────────────────────── */
        <motion.div
          key="workspace"
          variants={pageVariants} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.25 }}
        >
          {/* File info bar directly below the fixed nav */}
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
                onClick={handleReset}
                style={{
                  fontSize: 11, color: "var(--text-muted)", background: "none",
                  border: "1px solid var(--border)", borderRadius: 6,
                  padding: "3px 10px", cursor: "pointer",
                }}
              >
                {t("nav.newFile")}
              </button>
            </div>
          </div>

          <main style={{
            maxWidth: 1400, margin: "0 auto",
            padding: `${NAV_H + 36 + 24}px 32px 80px`,
          }}>
            <DataPreview data={data} onReset={handleReset} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 10, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid #7f1d1d", background: "#450a0a",
                  color: "#fca5a5", fontSize: 13,
                }}
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={results ? "results" : (selectedTest ?? "suggestions")}
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                transition={{ duration: 0.2 }}
              >
                {results ? renderResults() : renderSelector()}
              </motion.div>
            </AnimatePresence>
          </main>

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
        </motion.div>
      )}
    </AnimatePresence>
  )
}