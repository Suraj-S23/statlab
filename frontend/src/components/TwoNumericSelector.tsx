/**
 * TwoNumericSelector — lets the user pick two numeric columns
 * for correlation, regression, or dose-response analysis.
 * The label for each selector changes based on the analysis type.
 */

import { useState } from "react"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  labelA: string
  labelB: string
  onConfirm: (colA: string, colB: string) => void
  onBack: () => void
}

export default function TwoNumericSelector({
  columns,
  labelA,
  labelB,
  onConfirm,
  onBack,
}: Props) {
  const [colA, setColA] = useState<string | null>(null)
  const [colB, setColB] = useState<string | null>(null)

  const numeric = columns.filter((c) => c.type === "numeric")
  const canConfirm = colA !== null && colB !== null && colA !== colB

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Select Columns</h3>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
          ← Back
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">Select two different numeric columns.</p>

      {/* Column A */}
      <p className="text-gray-400 text-sm font-medium mb-3">{labelA}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <button
            key={col.name}
            onClick={() => setColA(col.name)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${colA === col.name
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
              }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* Column B */}
      <p className="text-gray-400 text-sm font-medium mb-3">{labelB}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <button
            key={col.name}
            onClick={() => setColB(col.name)}
            disabled={col.name === colA}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${colB === col.name
                ? "bg-blue-600 border-blue-500 text-white"
                : col.name === colA
                ? "bg-gray-800 border-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
              }`}
          >
            {col.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(colA!, colB!)}
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