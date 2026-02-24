/**
 * TwoGroupSelector — lets the user pick one categorical column
 * (grouping variable) and one numeric column (outcome) for
 * two-group comparison analysis.
 */

import { useState } from "react"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (groupCol: string, valueCol: string) => void
  onBack: () => void
}

export default function TwoGroupSelector({ columns, onConfirm, onBack }: Props) {
  const [groupCol, setGroupCol] = useState<string | null>(null)
  const [valueCol, setValueCol] = useState<string | null>(null)

  const categorical = columns.filter(
    (c) => c.type === "categorical" || c.type === "boolean"
  )
  const numeric = columns.filter((c) => c.type === "numeric")

  const canConfirm = groupCol !== null && valueCol !== null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Select Columns</h3>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all"
        >
          ← Back
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Select one grouping column (categorical/boolean, must have exactly 2 unique values)
        and one numeric outcome column.
      </p>

      {/* Group column selector */}
      <p className="text-gray-400 text-sm font-medium mb-3">
        Grouping column (categorical / boolean)
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {categorical.map((col) => (
          <button
            key={col.name}
            onClick={() => setGroupCol(col.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${groupCol === col.name
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-purple-500 hover:text-white"
              }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* Value column selector */}
      <p className="text-gray-400 text-sm font-medium mb-3">
        Outcome column (numeric)
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <button
            key={col.name}
            onClick={() => setValueCol(col.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${valueCol === col.name
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
              }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(groupCol!, valueCol!)}
        disabled={!canConfirm}
        className={`px-6 py-3 rounded-xl font-medium transition-all
          ${canConfirm
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
      >
        Run Analysis
      </button>
    </div>
  )
}