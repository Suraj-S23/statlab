/**
 * App — root component with animated page transitions.
 * Manages upload state, selected test, and analysis results.
 */

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UploadZone from "./components/UploadZone"
import DataPreview from "./components/DataPreview"
import SuggestionPanel from "./components/SuggestionPanel"
import ColumnSelector from "./components/ColumnSelector"
import TwoGroupSelector from "./components/TwoGroupSelector"
import TwoNumericSelector from "./components/TwoNumericSelector"
import KaplanMeierSelector from "./components/KaplanMeierSelector"
import DescriptiveResults from "./components/DescriptiveResults"
import TwoGroupResults from "./components/TwoGroupResults"
import AnovaResults from "./components/AnovaResults"
import CorrelationResults from "./components/CorrelationResults"
import RegressionResults from "./components/RegressionResults"
import ChiSquareResults from "./components/ChiSquareResults"
import DoseResponseResults from "./components/DoseResponseResults"
import KaplanMeierResults from "./components/KaplanMeierResults"
import {
  runDescriptive,
  runTwoGroup,
  runAnova,
  runCorrelation,
  runRegression,
  runChiSquare,
  runDoseResponse,
  runKaplanMeier,
} from "./services/api"
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
} from "./types"

type AnyResults =
  | { type: "descriptive"; data: DescResults }
  | { type: "two-group"; data: TwoResults }
  | { type: "anova"; data: AnovaRes }
  | { type: "correlation"; data: CorrRes }
  | { type: "regression"; data: RegRes }
  | { type: "chi-square"; data: ChiRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier"; data: KMRes }

/** Framer Motion variants for page-level fade+slide transitions. */
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = { duration: 0.25 }

function App() {
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

  const renderResults = () => {
    if (!results) return null
    const props = { onBack: handleBackToSuggestions }
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

  const renderSelector = () => {
    if (!data) return null
    if (loading) return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="mt-12 flex flex-col items-center gap-4"
      >
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Running analysis...</p>
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
          onConfirm={(t, e, g) => runAnalysis(() => runKaplanMeier(data.session_id, t, e, g), "kaplan-meier")}
          onBack={handleBackToSuggestions} />

      default:
        return <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top navigation bar */}
      <nav className="border-b border-gray-800 bg-gray-950 bg-opacity-80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">StatLab</span>
          </button>

          {data && (
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">{data.filename}</span>
              <span className="text-gray-700">·</span>
              <span className="text-gray-500 text-xs">{data.rows.toLocaleString()} rows</span>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-600 px-3 py-1 rounded-lg transition-all"
              >
                New file
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pb-20">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="landing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* Hero section */}
              <div className="pt-20 pb-14 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  Open source · No account required
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
                  Statistical analysis<br />
                  <span className="text-blue-400">for researchers</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                  Upload a CSV and run professional-grade statistical tests —
                  t-tests, ANOVA, regression, survival analysis and more.
                  No coding required.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                  {[
                    "Descriptive statistics",
                    "t-test & Mann-Whitney",
                    "ANOVA",
                    "Correlation",
                    "Linear regression",
                    "Chi-square",
                    "Dose-response / IC50",
                    "Kaplan-Meier survival",
                  ].map((f) => (
                    <span
                      key={f}
                      className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <UploadZone onUpload={setData} />

              {/* How it works */}
              <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "01",
                    title: "Upload your data",
                    desc: "Drop a CSV file. StatLab automatically detects column types and suggests relevant tests.",
                  },
                  {
                    step: "02",
                    title: "Choose an analysis",
                    desc: "Select from eight statistical tests. StatLab guides you through column selection.",
                  },
                  {
                    step: "03",
                    title: "Export your results",
                    desc: "Download results as PDF reports, PNG charts, or CSV data for further analysis.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="p-6 rounded-2xl border border-gray-800 bg-gray-900">
                    <span className="text-blue-500 text-xs font-mono font-semibold">{step}</span>
                    <h3 className="text-white font-semibold mt-2 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="pt-8"
            >
              <DataPreview data={data} onReset={handleReset} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl border border-red-800 bg-red-950 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={results ? "results" : selectedTest ?? "suggestions"}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={pageTransition}
                >
                  {results ? renderResults() : renderSelector()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <span className="text-gray-600 text-xs">StatLab — Statistical analysis for researchers</span>
          <span className="text-gray-600 text-xs">Built with FastAPI · React · Redis</span>
        </div>
      </footer>
    </div>
  )
}

export default App