/**
 * App — root component. Manages top-level application state:
 * uploaded data, selected test, column selection, and results.
 */

import { useState } from "react"
import UploadZone from "./components/UploadZone"
import DataPreview from "./components/DataPreview"
import SuggestionPanel from "./components/SuggestionPanel"
import ColumnSelector from "./components/ColumnSelector"
import DescriptiveResults from "./components/DescriptiveResults"
import { runDescriptive } from "./services/api"
import type { UploadResponse, DescriptiveResults as DescResults } from "./types"

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [results, setResults] = useState<DescResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /** Run the selected test with the chosen columns. */
  const handleRunAnalysis = async (columns: string[]) => {
    if (!data || !selectedTest) return
    setLoading(true)
    setError("")
    try {
      if (selectedTest === "Descriptive Statistics") {
        const res = await runDescriptive(data.session_id, columns)
        setResults(res)
      }
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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">StatLab</h1>
      <p className="text-gray-400 mb-10">Statistical analysis for researchers</p>

      {!data ? (
        <UploadZone onUpload={setData} />
      ) : (
        <>
          <DataPreview data={data} onReset={handleReset} />

          {results ? (
            <DescriptiveResults
              results={results}
              onBack={() => setResults(null)}
            />
          ) : selectedTest ? (
            <>
              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
              {loading ? (
                <p className="text-blue-400 text-sm mt-6">Running analysis...</p>
              ) : (
                <ColumnSelector
                  columns={data.columns}
                  filterType="numeric"
                  onConfirm={handleRunAnalysis}
                  onBack={() => setSelectedTest(null)}
                  minSelect={1}
                />
              )}
            </>
          ) : (
            <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
          )}
        </>
      )}
    </div>
  )
}

export default App