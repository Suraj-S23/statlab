/**
 * KaplanMeierSelector — lets the user pick time, event, and optional
 * group columns for Kaplan-Meier survival analysis.
 */

import { useState } from "react"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (timeCol: string, eventCol: string, groupCol?: string) => void
  onBack: () => void
}

export default function KaplanMeierSelector({ columns, onConfirm, onBack }: Props) {
  const [timeCol, setTimeCol] = useState<string | null>(null)
  const [eventCol, setEventCol] = useState<string | null>(null)
  const [groupCol, setGroupCol] = useState<string | null>(null)

  const numeric = columns.filter((c) => c.type === "numeric")
  const categorical = columns.filter(
    (c) => c.type === "categorical" || c.type === "boolean"
  )

  const canConfirm = timeCol !== null && eventCol !== null && timeCol !== eventCol

  const ColButton = ({
    col,
    selected,
    onSelect,
    disabled,
  }: {
    col: Column
    selected: boolean
    onSelect: () => void
    disabled?: boolean
  }) => (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
        ${selected
          ? "bg-blue-600 border-blue-500 text-white"
          : disabled
          ? "bg-gray-800 border-gray-800 text-gray-600 cursor-not-allowed"
          : "bg-gray-900 border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
        }`}
    >
      {col.name}
    </button>
  )

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Select Columns</h3>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
          ← Back
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Select a time column, an event column (0 = censored, 1 = event occurred),
        and an optional grouping column.
      </p>

      <p className="text-gray-400 text-sm font-medium mb-3">Time column (numeric)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColButton
            key={col.name}
            col={col}
            selected={timeCol === col.name}
            onSelect={() => setTimeCol(col.name)}
            disabled={col.name === eventCol}
          />
        ))}
      </div>

      <p className="text-gray-400 text-sm font-medium mb-3">Event column (0/1 numeric)</p>
      <div className="flex flex-wrap gap-2 mb-8">
        {numeric.map((col) => (
          <ColButton
            key={col.name}
            col={col}
            selected={eventCol === col.name}
            onSelect={() => setEventCol(col.name)}
            disabled={col.name === timeCol}
          />
        ))}
      </div>

      <p className="text-gray-400 text-sm font-medium mb-3">
        Group column (optional — categorical or boolean)
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setGroupCol(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
            ${groupCol === null
              ? "bg-gray-700 border-gray-500 text-white"
              : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
        >
          None
        </button>
        {categorical.map((col) => (
          <ColButton
            key={col.name}
            col={col}
            selected={groupCol === col.name}
            onSelect={() => setGroupCol(col.name)}
          />
        ))}
      </div>

      <button
        onClick={() => canConfirm && onConfirm(timeCol!, eventCol!, groupCol ?? undefined)}
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