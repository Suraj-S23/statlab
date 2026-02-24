import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (groupCol: string, valueCol: string) => void
  onBack: () => void
}

function ColBtn({ name, selected, onClick, colour = "blue", disabled }: {
  name: string; selected: boolean; onClick: () => void; colour?: "blue" | "purple"; disabled?: boolean
}) {
  const bgSelected = colour === "purple" ? "#4c1d95" : "var(--accent)"
  const colorSelected = colour === "purple" ? "#c4b5fd" : "var(--bg)"
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 500,
      fontFamily: "var(--font-mono)", cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      background: selected ? bgSelected : disabled ? "var(--bg-alt)" : "var(--surface)",
      color: selected ? colorSelected : disabled ? "var(--text-muted)" : "var(--text)",
      border: `1px solid ${selected ? bgSelected : "var(--border)"}`,
      opacity: disabled ? 0.4 : 1,
    }}>{name}</button>
  )
}

export default function TwoGroupSelector({ columns, onConfirm, onBack }: Props) {
  const { t } = useTranslation()
  const [groupCol, setGroupCol] = useState<string | null>(null)
  const [valueCol, setValueCol] = useState<string | null>(null)
  const categorical = columns.filter(c => c.type === "categorical" || c.type === "boolean")
  const numeric = columns.filter(c => c.type === "numeric")

  const selectedGroupCol = groupCol ? columns.find(c => c.name === groupCol) : null
  const tooManyGroups = selectedGroupCol && selectedGroupCol.unique_count > 2
  const canConfirm = groupCol !== null && valueCol !== null && !tooManyGroups

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>{t("common.selectColumns")}</h3>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
        {t("selector.groupingCol")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: tooManyGroups ? 10 : 22 }}>
        {categorical.map(col => <ColBtn key={col.name} name={col.name} selected={groupCol === col.name} onClick={() => setGroupCol(col.name)} colour="purple" />)}
      </div>
      {tooManyGroups && (
        <div style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #92400e", background: "#1c0a00", marginBottom: 18 }}>
          <p style={{ color: "#fbbf24", fontSize: 11, margin: 0 }}>
            {t("selector.tooManyGroups", { col: groupCol, count: selectedGroupCol!.unique_count })}
          </p>
        </div>
      )}
      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
        {t("selector.outcomeCol")}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
        {numeric.map(col => <ColBtn key={col.name} name={col.name} selected={valueCol === col.name} onClick={() => setValueCol(col.name)} />)}
      </div>
      <button onClick={() => canConfirm && onConfirm(groupCol!, valueCol!)} disabled={!canConfirm}
        style={{ padding: "8px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: canConfirm ? "pointer" : "not-allowed", background: canConfirm ? "var(--accent)" : "var(--bg-alt)", color: canConfirm ? "var(--bg)" : "var(--text-muted)", border: "none", transition: "all 0.15s" }}>
        {t("common.runAnalysis")}
      </button>
    </motion.div>
  )
}