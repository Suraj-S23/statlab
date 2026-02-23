import { useState } from "react"
import UploadZone from "./components/UploadZone"
import type { UploadResponse } from "./types"

function App() {
  const [data, setData] = useState<UploadResponse | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold text-blue-400 mb-2">StatLab</h1>
      <p className="text-gray-400 mb-10">Statistical analysis for researchers</p>

      {!data ? (
        <UploadZone onUpload={setData} />
      ) : (
        <div className="mt-6">
          <p className="text-green-400 font-semibold">{data.filename} uploaded successfully</p>
          <p className="text-gray-400 text-sm mt-1">{data.rows} rows · {data.columns.length} columns</p>
          <div className="mt-4 flex gap-2 flex-wrap">
            {data.columns.map((col) => (
              <span key={col.name} className={`px-3 py-1 rounded-full text-xs font-medium
                ${col.type === "numeric" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300"}`}>
                {col.name} · {col.type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App