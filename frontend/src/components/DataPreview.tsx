/**
 * DataPreview — compact header showing file info and column type badges.
 */

import { motion } from "framer-motion"
import type { UploadResponse } from "../types"

interface Props {
  data: UploadResponse
  onReset: () => void
}

export default function DataPreview({ data, onReset }: Props) {
  const numericCount = data.columns.filter((c) => c.type === "numeric").length
  const categoricalCount = data.columns.filter((c) => c.type === "categorical").length
  const booleanCount = data.columns.filter((c) => c.type === "boolean").length
  const missingCount = data.columns.filter((c) => c.missing > 0).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-gray-800 bg-gray-900 mb-6"
    >
      {/* File header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <h2 className="text-white font-semibold text-sm">{data.filename}</h2>
          </div>
          <p className="text-gray-500 text-xs">
            {data.rows.toLocaleString()} rows · {data.columns.length} columns ·{" "}
            {numericCount} numeric · {categoricalCount} categorical · {booleanCount} boolean
            {missingCount > 0 && (
              <span className="text-yellow-500"> · {missingCount} columns with missing values</span>
            )}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Column badges */}
      <div className="flex flex-wrap gap-1.5">
        {data.columns.map((col) => (
          <span
            key={col.name}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium
              ${col.type === "numeric"
                ? "bg-blue-950 border-blue-900 text-blue-300"
                : col.type === "boolean"
                ? "bg-green-950 border-green-900 text-green-300"
                : "bg-purple-950 border-purple-900 text-purple-300"
              }`}
          >
            {col.name}
            {col.missing > 0 && (
              <span className="text-yellow-400 font-normal">· {col.missing} missing</span>
            )}
          </span>
        ))}
      </div>
    </motion.div>
  )
}