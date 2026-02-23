/**
 * App — root component. Manages the top-level application state:
 * uploaded data and the currently selected statistical test.
 */

import { useState } from "react"
import UploadZone from "./components/UploadZone"
import DataPreview from "./components/DataPreview"
import SuggestionPanel from "./components/SuggestionPanel"
import type { UploadResponse } from "./types"

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">StatLab</h1>
      <p className="text-gray-400 mb-10">Statistical analysis for researchers</p>

      {!data ? (
        <UploadZone onUpload={setData} />
      ) : (
        <>
          <DataPreview data={data} onReset={() => {
            setData(null)
            setSelectedTest(null)
          }} />

          {/* Show selected test or suggestion panel */}
          {selectedTest ? (
            <div className="mt-10 p-4 border border-blue-800 rounded-xl bg-blue-950">
              <p className="text-blue-300 font-medium">Selected: {selectedTest}</p>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-xs text-gray-500 hover:text-gray-300 mt-2"
              >
                ← Back to suggestions
              </button>
            </div>
          ) : (
            <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
          )}
        </>
      )}
    </div>
  )
}

export default App