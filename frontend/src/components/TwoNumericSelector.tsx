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

function ColBtn({ name, selected, disabled, onClick }: { name: string; selected: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 500,
      fontFamily: "var(--font-mono)", cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      background: selected ? "var(--accent)" : disabled ? "var(--bg-alt)" : "var(--surface)",
      color: selected ? "var(--bg)" : disabled ? "var(--text-muted)" : "var(--text)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      opacity: disabled ? 0.4 : 1,
    }}>{name}</button>
  )
}

export default function TwoNumericSelector({ columns, labelA, labelB, onConfirm, onBack }: Props) {
  const [colA, setColA] = useState<string | null>(null)
  const [colB, setColB] = useState<string | null>(null)
  const numeric = columns.filter(c => c.type === "numeric")
  const canConfirm = colA !== null && colB !== null && colA !== colB

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>Select columns</h3>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>{labelA}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {numeric.map(col => <ColBtn key={col.name} name={col.name} selected={colA === col.name} onClick={() => setColA(col.name)} />)}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>{labelB}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
        {numeric.map(col => <ColBtn key={col.name} name={col.name} selected={colB === col.name} disabled={col.name === colA} onClick={() => setColB(col.name)} />)}
      </div>

      <button onClick={() => canConfirm && onConfirm(colA!, colB!)} disabled={!canConfirm}
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
