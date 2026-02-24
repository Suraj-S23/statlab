/**
 * App — root component. Manages top-level application state:
 * uploaded data, selected test, column selection, and results.
 */

import { useState } from "react"
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

/** Union type for all possible analysis results. */
type AnyResults =
  | { type: "descriptive"; data: DescResults }
  | { type: "two-group"; data: TwoResults }
  | { type: "anova"; data: AnovaRes }
  | { type: "correlation"; data: CorrRes }
  | { type: "regression"; data: RegRes }
  | { type: "chi-square"; data: ChiRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier"; data: KMRes }

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [results, setResults] = useState<AnyResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /** Generic wrapper for all analysis calls. */
  async function runAnalysis<T>(
    fn: () => Promise<T>,
    type: AnyResults["type"]
  ) {
    setLoading(true)
    setError("")
    try {
      const data = await fn()
      setResults({ type, data } as AnyResults)
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

  /** Render the results component for the current analysis. */
  const renderResults = () => {
    if (!results) return null
    const props = { onBack: handleBackToSuggestions }

    switch (results.type) {
      case "descriptive":
        return <DescriptiveResults results={results.data} {...props} />
      case "two-group":
        return <TwoGroupResults results={results.data} {...props} />
      case "anova":
        return <AnovaResults results={results.data} {...props} />
      case "correlation":
        return <CorrelationResults results={results.data} {...props} />
      case "regression":
        return <RegressionResults results={results.data} {...props} />
      case "chi-square":
        return <ChiSquareResults results={results.data} {...props} />
      case "dose-response":
        return <DoseResponseResults results={results.data} {...props} />
      case "kaplan-meier":
        return <KaplanMeierResults results={results.data} {...props} />
    }
  }

  /** Render the column selector for the selected test. */
  const renderSelector = () => {
    if (!data) return null

    if (loading) return (
      <p className="text-blue-400 text-sm mt-6">Running analysis...</p>
    )

    switch (selectedTest) {
      case "Descriptive Statistics":
        return (
          <ColumnSelector
            columns={data.columns}
            filterType="numeric"
            onConfirm={(cols) => runAnalysis(
              () => runDescriptive(data.session_id, cols),
              "descriptive"
            )}
            onBack={handleBackToSuggestions}
            minSelect={1}
          />
        )

      case "Independent t-test / Mann-Whitney U":
        return (
          <TwoGroupSelector
            columns={data.columns}
            onConfirm={(g, v) => runAnalysis(
              () => runTwoGroup(data.session_id, g, v),
              "two-group"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      case "One-Way ANOVA":
        return (
          <TwoGroupSelector
            columns={data.columns}
            onConfirm={(g, v) => runAnalysis(
              () => runAnova(data.session_id, g, v),
              "anova"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      case "Correlation (Pearson / Spearman)":
        return (
          <TwoNumericSelector
            columns={data.columns}
            labelA="First column"
            labelB="Second column"
            onConfirm={(a, b) => runAnalysis(
              () => runCorrelation(data.session_id, a, b),
              "correlation"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      case "Simple Linear Regression":
        return (
          <TwoNumericSelector
            columns={data.columns}
            labelA="Predictor column (X)"
            labelB="Outcome column (Y)"
            onConfirm={(a, b) => runAnalysis(
              () => runRegression(data.session_id, a, b),
              "regression"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      case "Chi-Square / Fisher's Exact Test":
        return (
          <ColumnSelector
            columns={data.columns}
            filterType="categorical"
            onConfirm={(cols) => runAnalysis(
              () => runChiSquare(data.session_id, cols[0], cols[1]),
              "chi-square"
            )}
            onBack={handleBackToSuggestions}
            minSelect={2}
            maxSelect={2}
          />
        )

      case "Dose-Response / IC50 Curve":
        return (
          <TwoNumericSelector
            columns={data.columns}
            labelA="Concentration column"
            labelB="Response column"
            onConfirm={(a, b) => runAnalysis(
              () => runDoseResponse(data.session_id, a, b),
              "dose-response"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      case "Kaplan-Meier Survival Analysis":
        return (
          <KaplanMeierSelector
            columns={data.columns}
            onConfirm={(t, e, g) => runAnalysis(
              () => runKaplanMeier(data.session_id, t, e, g),
              "kaplan-meier"
            )}
            onBack={handleBackToSuggestions}
          />
        )

      default:
        return <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">StatLab</h1>
      <p className="text-gray-400 mb-10">Statistical analysis for researchers</p>

      {!data ? (
        <UploadZone onUpload={setData} />
      ) : (
        <>
          <DataPreview data={data} onReset={handleReset} />
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          {results ? renderResults() : renderSelector()}
        </>
      )}
    </div>
  )
}

export default App