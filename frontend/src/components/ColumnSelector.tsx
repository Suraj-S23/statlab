/**
 * ColumnSelector — multi-select column picker filtered by type.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  filterType: "numeric" | "categorical" | "boolean"
  onConfirm: (columns: string[]) => void
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
  const [selected, setSelected] = useState<string[]>([])
  const filtered = columns.filter((c) => c.type === filterType)
  const canConfirm = selected.length >= minSelect && (!maxSelect || selected.length <= maxSelect)

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter((s) => s !== name))
    } else if (!maxSelect || selected.length < maxSelect) {
      setSelected([...selected, name])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">Select columns</h3>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Select {maxSelect === 1 ? "one" : maxSelect ? `up to ${maxSelect}` : "any number of"}{" "}
        {filterType} column{maxSelect !== 1 ? "s" : ""}.
        {minSelect > 1 && ` Minimum ${minSelect}.`}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {filtered.map((col) => {
          const isSelected = selected.includes(col.name)
          const isDisabled = !isSelected && maxSelect !== undefined && selected.length >= maxSelect
          return (
            <button
              key={col.name}
              onClick={() => !isDisabled && toggle(col.name)}
              disabled={isDisabled}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all
                ${isSelected
                  ? "bg-blue-600 border-blue-500 text-white"
                  : isDisabled
                  ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
            >
              {col.name}
              {col.missing > 0 && <span className="ml-1.5 text-yellow-500 text-xs">⚠</span>}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(selected)}
        disabled={!canConfirm}
        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all
          ${canConfirm
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
      >
        Run Analysis
      </button>
    </motion.div>
  )
}