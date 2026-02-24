/**
 * UploadZone — drag-and-drop CSV upload with animated states.
 */

import { useState, useRef } from "react"
import { motion } from "framer-motion"
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
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const data = await uploadCSV(file)
      onUpload(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
          ${dragging
            ? "border-blue-500 bg-blue-950 bg-opacity-30"
            : "border-gray-700 hover:border-gray-500 bg-gray-900 hover:bg-gray-800"
          }`}
      >
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          {loading ? (
            <>
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-300 font-medium">Parsing your data...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a moment for large files</p>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors
                ${dragging ? "bg-blue-600" : "bg-gray-800"}`}>
                <svg className={`w-7 h-7 transition-colors ${dragging ? "text-white" : "text-gray-400"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg mb-1">
                {dragging ? "Drop your CSV here" : "Upload your CSV"}
              </p>
              <p className="text-gray-500 text-sm">
                Drag and drop or <span className="text-blue-400 hover:text-blue-300">browse files</span>
              </p>
              <p className="text-gray-600 text-xs mt-3">CSV files only · No size limit</p>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-3 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}