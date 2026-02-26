import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import type { UploadResponse } from "../types"

interface Props { data: UploadResponse; onReset: () => void }

const TYPE_LABEL: Record<string, string> = {
  numeric: "num",
  categorical: "cat",
  boolean: "bool",
}

export default function DataPreview({ data, onReset }: Props) {
  const { t } = useTranslation()
  const numericCount     = data.columns.filter(c => c.type === "numeric").length
  const categoricalCount = data.columns.filter(c => c.type === "categorical").length
  const booleanCount     = data.columns.filter(c => c.type === "boolean").length
  const missingCount     = data.columns.filter(c => c.missing > 0).length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "14px 18px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", marginBottom: 16 }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 13 }}>{data.filename}</span>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {data.rows.toLocaleString()} {t("nav.rows")} · {data.columns.length} {t("dataPreview.columns")} · {numericCount} {t("dataPreview.numeric")} · {categoricalCount} {t("dataPreview.categorical")} · {booleanCount} {t("dataPreview.boolean")}
            {missingCount > 0 && <span style={{ color: "#f59e0b" }}> · {missingCount} {t("dataPreview.missingValues")}</span>}
          </span>
        </div>
        <button onClick={onReset} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 16, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
      </div>

      {/* Column badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {data.columns.map(col => {
          const bgVar  = col.type === "numeric" ? "var(--badge-numeric-bg)"  : col.type === "boolean" ? "var(--badge-bool-bg)"  : "var(--badge-cat-bg)"
          const txtVar = col.type === "numeric" ? "var(--badge-numeric-text)": col.type === "boolean" ? "var(--badge-bool-text)": "var(--badge-cat-text)"
          return (
            <span key={col.name} style={{
              background: bgVar, color: txtVar, fontSize: 10,
              padding: "2px 8px", borderRadius: 6, border: `1px solid ${txtVar}22`,
              fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              {col.name}
              <span style={{ opacity: 0.6, fontSize: 9, fontWeight: 600 }}>
                {TYPE_LABEL[col.type] ?? col.type}
              </span>
              {col.missing > 0 && (
                <span style={{ color: "#f59e0b", fontSize: 9 }}>· {col.missing} {t("dataPreview.missing")}</span>
              )}
            </span>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
        {[
          { type: "numeric",     bg: "var(--badge-numeric-bg)",  txt: "var(--badge-numeric-text)", label: "Numeric" },
          { type: "categorical", bg: "var(--badge-cat-bg)",       txt: "var(--badge-cat-text)",     label: "Categorical" },
          { type: "boolean",     bg: "var(--badge-bool-bg)",      txt: "var(--badge-bool-text)",    label: "Boolean" },
        ].map(({ bg, txt, label, type }) => {
          const hasType = data.columns.some(c => c.type === type)
          if (!hasType) return null
          return (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                background: bg, color: txt, fontSize: 9, fontWeight: 600,
                padding: "1px 6px", borderRadius: 4, border: `1px solid ${txt}22`,
                fontFamily: "var(--font-mono)",
              }}>
                {TYPE_LABEL[type]}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{label}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}