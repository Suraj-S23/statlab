/**
 * TwoGroupSelector — picks one categorical/boolean and one numeric column.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (groupCol: string, valueCol: string) => void
  onBack: () => void
}

export default function TwoGroupSelector({ columns, onConfirm, onBack }: Props) {
  const [groupCol, setGroupCol] = useState<string | null>(null)
  const [valueCol, setValueCol] = useState<string | null>(null)

  const categorical = columns.filter((c) => c.type === "categorical" || c.type === "boolean")
  const numeric = columns.filter((c) => c.type === "numeric")
  const canConfirm = groupCol !== null && valueCol !== null

  const ColBtn = ({
    name,
    selected,
    onClick,
    colour,
  }: {
    name: string
    selected: boolean
    onClick: () => void
    colour: "purple" | "blue"
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all
        ${selected
          ? colour === "purple"
            ? "bg-purple-600 border-purple-500 text-white"
            : "bg-blue-600 border-blue-500 text-white"
          : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
        }`}
    >
      {name}
    </button>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Select columns</h3>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
      </div>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Grouping column (categorical · boolean)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {categorical.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={groupCol === col.name}
            onClick={() => setGroupCol(col.name)} colour="purple" />
        ))}
      </div>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Outcome column (numeric)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={valueCol === col.name}
            onClick={() => setValueCol(col.name)} colour="blue" />
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(groupCol!, valueCol!)}
        disabled={!canConfirm}
        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all
          ${canConfirm ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
      >
        Run Analysis
      </button>
    </motion.div>
  )
}