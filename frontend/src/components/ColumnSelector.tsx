/**
 * ColumnSelector — multi-select column picker filtered by type.
 * For categorical columns, filters out high-cardinality columns (>20 unique values)
 * that would be meaningless in tests like chi-square.
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

const MAX_CATEGORICAL_UNIQUE = 20

export default function ColumnSelector({ columns, filterType, onConfirm, onBack, minSelect = 1, maxSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const filtered = columns.filter(c => {
    if (c.type !== filterType) return false
    // For categorical, exclude high-cardinality columns like IDs
    if (filterType === "categorical" && c.unique_count > MAX_CATEGORICAL_UNIQUE) return false
    return true
  })

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

      {filtered.length === 0 && (
        <p style={{ color: "#f59e0b", fontSize: 12, marginBottom: 16 }}>
          No suitable {filterType} columns found. For chi-square, columns with more than {MAX_CATEGORICAL_UNIQUE} unique values are excluded.
        </p>
      )}

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
              {col.missing > 0 && (
                <span style={{ color: "#f59e0b", marginLeft: 5, display: "inline-flex", verticalAlign: "middle" }}>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </span>
              )}
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