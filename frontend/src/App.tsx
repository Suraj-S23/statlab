import { useState } from "react"
import UploadZone from "./components/UploadZone"
import DataPreview from "./components/DataPreview"
import type { UploadResponse } from "./types"

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">StatLab</h1>
      <p className="text-gray-400 mb-10">Statistical analysis for researchers</p>

      {!data ? (
        <UploadZone onUpload={setData} />
      ) : (
        <DataPreview data={data} onReset={() => setData(null)} />
      )}
    </div>
  )
}

export default App