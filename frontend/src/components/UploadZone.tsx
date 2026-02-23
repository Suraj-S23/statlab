import { useState, useRef } from "react"
import { uploadCSV } from "../services/api"
import type { UploadResponse } from "../types"

interface Props {
  onUpload: (data: UploadResponse) => void
}

export default function UploadZone({ onUpload }: Props) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setLoading(true)
    setError("")
    try {
      const data = await uploadCSV(file)
      onUpload(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload Failure")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
      className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
        ${dragging ? "border-blue-500 bg-blue-950" : "border-gray-600 hover:border-blue-400 bg-gray-900"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      {loading ? (
        <p className="text-blue-400 text-lg">Parsing your data...</p>
      ) : (
        <>
          <p className="text-gray-200 text-xl font-semibold">Drop your CSV here</p>
          <p className="text-gray-500 mt-2 text-sm">or click to browse</p>
        </>
      )}
      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
    </div>
  )
}