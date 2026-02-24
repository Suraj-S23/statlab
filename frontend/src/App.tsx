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
import DescriptiveResults from "./components/DescriptiveResults"
import TwoGroupResults from "./components/TwoGroupResults"
import { runDescriptive, runTwoGroup } from "./services/api"
import type {
  UploadResponse,
  DescriptiveResults as DescResults,
  TwoGroupResults as TwoResults,
} from "./types"

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [descResults, setDescResults] = useState<DescResults | null>(null)
  const [twoGroupResults, setTwoGroupResults] = useState<TwoResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /** Run descriptive statistics on selected columns. */
  const handleDescriptive = async (columns: string[]) => {
    if (!data) return
    setLoading(true)
    setError("")
    try {
      const res = await runDescriptive(data.session_id, columns)
      setDescResults(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  /** Run two-group comparison with selected group and value columns. */
  const handleTwoGroup = async (groupCol: string, valueCol: string) => {
    if (!data) return
    setLoading(true)
    setError("")
    try {
      const res = await runTwoGroup(data.session_id, groupCol, valueCol)
      setTwoGroupResults(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setData(null)
    setSelectedTest(null)
    setDescResults(null)
    setTwoGroupResults(null)
    setError("")
  }

  const handleBackToSuggestions = () => {
    setSelectedTest(null)
    setDescResults(null)
    setTwoGroupResults(null)
    setError("")
  }

  /** Render the appropriate analysis view based on selected test. */
  const renderAnalysis = () => {
    if (!data) return null

    // Results views
    if (descResults) {
      return <DescriptiveResults results={descResults} onBack={handleBackToSuggestions} />
    }
    if (twoGroupResults) {
      return <TwoGroupResults results={twoGroupResults} onBack={handleBackToSuggestions} />
    }

    // Loading state
    if (loading) {
      return <p className="text-blue-400 text-sm mt-6">Running analysis...</p>
    }

    // Column selectors
    if (selectedTest === "Descriptive Statistics") {
      return (
        <ColumnSelector
          columns={data.columns}
          filterType="numeric"
          onConfirm={handleDescriptive}
          onBack={handleBackToSuggestions}
          minSelect={1}
        />
      )
    }

    if (selectedTest === "Independent t-test / Mann-Whitney U") {
      return (
        <TwoGroupSelector
          columns={data.columns}
          onConfirm={handleTwoGroup}
          onBack={handleBackToSuggestions}
        />
      )
    }

    // Default — show suggestion panel
    return <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
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
          {renderAnalysis()}
        </>
      )}
    </div>
  )
}

export default App