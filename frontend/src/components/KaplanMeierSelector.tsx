/**
 * KaplanMeierSelector — picks time, event, and optional group columns.
 */

import { useState } from "react"
import { motion } from "framer-motion"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (timeCol: string, eventCol: string, groupCol?: string) => void
  onBack: () => void
}

function ColBtn({
  name, selected, disabled, onClick, colour = "blue",
}: {
  name: string; selected: boolean; disabled?: boolean; onClick: () => void; colour?: "blue" | "purple" | "gray"
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all
        ${selected
          ? colour === "purple" ? "bg-purple-600 border-purple-500 text-white"
          : colour === "gray" ? "bg-gray-700 border-gray-500 text-white"
          : "bg-blue-600 border-blue-500 text-white"
          : disabled ? "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed"
          : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
        }`}
    >
      {name}
    </button>
  )
}

export default function KaplanMeierSelector({ columns, onConfirm, onBack }: Props) {
  const [timeCol, setTimeCol] = useState<string | null>(null)
  const [eventCol, setEventCol] = useState<string | null>(null)
  const [groupCol, setGroupCol] = useState<string | null>(null)

  const numeric = columns.filter((c) => c.type === "numeric")
  const categorical = columns.filter((c) => c.type === "categorical" || c.type === "boolean")
  const canConfirm = timeCol !== null && eventCol !== null && timeCol !== eventCol

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Select columns</h3>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Select a time column, an event column (0 = censored, 1 = event occurred), and an optional group column.
      </p>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Time column</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={timeCol === col.name}
            disabled={col.name === eventCol} onClick={() => setTimeCol(col.name)} />
        ))}
      </div>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Event column (0/1)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={eventCol === col.name}
            disabled={col.name === timeCol} onClick={() => setEventCol(col.name)} />
        ))}
      </div>

      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Group column (optional)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        <ColBtn name="None" selected={groupCol === null} onClick={() => setGroupCol(null)} colour="gray" />
        {categorical.map((col) => (
          <ColBtn key={col.name} name={col.name} selected={groupCol === col.name}
            onClick={() => setGroupCol(col.name)} colour="purple" />
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(timeCol!, eventCol!, groupCol ?? undefined)}
        disabled={!canConfirm}
        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all
          ${canConfirm ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}
      >
        Run Analysis
      </button>
    </motion.div>
  )
}