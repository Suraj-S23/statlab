/**
 * ColumnSelector — multi-select column picker filtered by type.
 * Theme-aware via CSS variables.
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

export default function ColumnSelector({ columns, filterType, onConfirm, onBack, minSelect = 1, maxSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const filtered = columns.filter(c => c.type === filterType)
  const canConfirm = selected.length >= minSelect && (!maxSelect || selected.length <= maxSelect)

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      setSelected(selected.filter(s => s !== name))
    } else if (!maxSelect || selected.length < maxSelect) {
      setSelected([...selected, name])
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>Select columns</h3>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 18 }}>
        Select {maxSelect === 1 ? "one" : maxSelect ? `up to ${maxSelect}` : "any"} {filterType} column{maxSelect !== 1 ? "s" : ""}.
        {minSelect > 1 && ` Minimum ${minSelect}.`}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
        {filtered.map(col => {
          const isSelected = selected.includes(col.name)
          const isDisabled = !isSelected && maxSelect !== undefined && selected.length >= maxSelect
          return (
            <button key={col.name} onClick={() => !isDisabled && toggle(col.name)} disabled={isDisabled}
              style={{
                padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                fontFamily: "var(--font-mono)", cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                background: isSelected ? "var(--accent)" : isDisabled ? "var(--bg-alt)" : "var(--surface)",
                color: isSelected ? "var(--bg)" : isDisabled ? "var(--text-muted)" : "var(--text)",
                border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                opacity: isDisabled ? 0.5 : 1,
              }}>
              {col.name}
              {col.missing > 0 && <span style={{ color: "#f59e0b", marginLeft: 5, fontSize: 10 }}>⚠</span>}
            </button>
          )
        })}
      </div>

      <button onClick={() => canConfirm && onConfirm(selected)} disabled={!canConfirm}
        style={{
          padding: "8px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: canConfirm ? "pointer" : "not-allowed",
          background: canConfirm ? "var(--accent)" : "var(--bg-alt)",
          color: canConfirm ? "var(--bg)" : "var(--text-muted)",
          border: "none", transition: "all 0.15s",
        }}>
        Run Analysis
      </button>
    </motion.div>
  )
}
