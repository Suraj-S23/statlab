/**
 * ColumnSelector — lets the user pick which columns to include
 * in the selected analysis. Filters to only show relevant column types.
 */

import { useState } from "react"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  filterType?: "numeric" | "categorical" | "boolean" // if set, only show this type
  onConfirm: (selected: string[]) => void
  onBack: () => void
  minSelect?: number
  maxSelect?: number
}

export default function ColumnSelector({
  columns,
  filterType,
  onConfirm,
  onBack,
  minSelect = 1,
  maxSelect,
}: Props) {
  const available = filterType
    ? columns.filter((c) => c.type === filterType)
    : columns

  const [selected, setSelected] = useState<string[]>([])

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : maxSelect && prev.length >= maxSelect
        ? prev  // don't add more than maxSelect
        : [...prev, name]
    )
  }

  const canConfirm = selected.length >= minSelect

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

      <p className="text-gray-500 text-sm mb-6">
        {filterType ? `Showing ${filterType} columns only. ` : ""}
        Select at least {minSelect} column{minSelect > 1 ? "s" : ""} to continue.
        {maxSelect && ` (Max ${maxSelect})`}
      </p>

      {/* Column toggle buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {available.map((col) => {
          const isSelected = selected.includes(col.name)
          return (
            <button
              key={col.name}
              onClick={() => toggle(col.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
                ${isSelected
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
                }`}
            >
              {col.name}
              {col.missing > 0 && (
                <span className="ml-1 text-yellow-400 text-xs">⚠</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(selected)}
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