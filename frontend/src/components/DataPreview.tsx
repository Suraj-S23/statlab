/**
 * DataPreview — compact header showing file info and column type badges.
 * Theme-aware via CSS variables.
 */

import { motion } from "framer-motion"
import type { UploadResponse } from "../types"

interface Props {
  data: UploadResponse
  onReset: () => void
}

export default function DataPreview({ data, onReset }: Props) {
  const numericCount    = data.columns.filter(c => c.type === "numeric").length
  const categoricalCount = data.columns.filter(c => c.type === "categorical").length
  const booleanCount    = data.columns.filter(c => c.type === "boolean").length
  const missingCount    = data.columns.filter(c => c.missing > 0).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: "14px 18px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        marginBottom: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{data.filename}</span>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {data.rows.toLocaleString()} rows · {data.columns.length} columns ·{" "}
            {numericCount} numeric · {categoricalCount} categorical · {booleanCount} boolean
            {missingCount > 0 && (
              <span style={{ color: "#f59e0b" }}> · {missingCount} with missing values</span>
            )}
          </span>
        </div>
        <button onClick={onReset} style={{
          background: "none", border: "none",
          color: "var(--text-muted)", fontSize: 16,
          cursor: "pointer", padding: "0 4px",
          lineHeight: 1,
        }}>×</button>
      </div>

      {/* Column badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {data.columns.map(col => {
          const bgVar  = col.type === "numeric" ? "var(--badge-numeric-bg)"
                       : col.type === "boolean" ? "var(--badge-bool-bg)"
                       : "var(--badge-cat-bg)"
          const txtVar = col.type === "numeric" ? "var(--badge-numeric-text)"
                       : col.type === "boolean" ? "var(--badge-bool-text)"
                       : "var(--badge-cat-text)"
          return (
            <span key={col.name} style={{
              background: bgVar, color: txtVar,
              fontSize: 10, padding: "2px 9px", borderRadius: 6,
              border: `1px solid ${txtVar}22`,
              fontFamily: "var(--font-mono)",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {col.name}
              {col.missing > 0 && (
                <span style={{ color: "#f59e0b", fontSize: 9 }}>· {col.missing} missing</span>
              )}
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}
