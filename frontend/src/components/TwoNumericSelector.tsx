/**
 * TwoNumericSelector — picks two distinct numeric columns.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  labelA: string
  labelB: string
  onConfirm: (colA: string, colB: string) => void
  onBack: () => void
}

export default function TwoNumericSelector({ columns, labelA, labelB, onConfirm, onBack }: Props) {
  const [colA, setColA] = useState<string | null>(null)
  const [colB, setColB] = useState<string | null>(null)

  const numeric = columns.filter((c) => c.type === "numeric")
  const canConfirm = colA !== null && colB !== null && colA !== colB

  const ColBtn = ({
    name,
    selected,
    disabled,
    onClick,
  }: {
    name: string
    selected: boolean
    disabled?: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all
        ${selected
          ? "bg-blue-600 border-blue-500 text-white"
          : disabled
          ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
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

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">{labelA}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={colA === col.name}
            onClick={() => setColA(col.name)} />
        ))}
      </div>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">{labelB}</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={colB === col.name}
            disabled={col.name === colA} onClick={() => setColB(col.name)} />
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(colA!, colB!)}
        disabled={!canConfirm}
        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all
          ${canConfirm ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
      >
        Run Analysis
      </button>
    </motion.div>
  )
}