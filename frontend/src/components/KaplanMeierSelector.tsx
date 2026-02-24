import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import type { Column } from "../types"

interface Props {
  columns: Column[]
  onConfirm: (timeCol: string, eventCol: string, groupCol?: string) => void
  onBack: () => void
}

function ColBtn({ name, selected, disabled, onClick, colour = "blue" }: {
  name: string; selected: boolean; disabled?: boolean; onClick: () => void; colour?: "blue" | "purple" | "gray"
}) {
  const bg = selected ? colour === "purple" ? "#4c1d95" : colour === "gray" ? "var(--bg-alt)" : "var(--accent)" : disabled ? "var(--bg-alt)" : "var(--surface)"
  const color = selected ? colour === "purple" ? "#c4b5fd" : colour === "gray" ? "var(--text)" : "var(--bg)" : disabled ? "var(--text-muted)" : "var(--text)"
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 500,
      fontFamily: "var(--font-mono)", cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s", background: bg, color,
      border: `1px solid ${selected ? bg : "var(--border)"}`, opacity: disabled ? 0.4 : 1,
    }}>{name}</button>
  )
}

export default function KaplanMeierSelector({ columns, onConfirm, onBack }: Props) {
  const { t } = useTranslation()
  const [timeCol, setTimeCol] = useState<string | null>(null)
  const [eventCol, setEventCol] = useState<string | null>(null)
  const [groupCol, setGroupCol] = useState<string | null>(null)
  const numeric = columns.filter(c => c.type === "numeric")
  const eventCols = columns.filter(c => c.type === "numeric" || c.type === "boolean")
  const categorical = columns.filter(c => c.type === "categorical")
  const canConfirm = timeCol !== null && eventCol !== null && timeCol !== eventCol

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>{t("common.selectColumns")}</h3>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 20 }}>
        {t("selector.timeCol")}, {t("selector.eventCol")}, {t("selector.groupColOptional").toLowerCase()}.
      </p>

      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>{t("selector.timeCol")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {numeric.map(col => <ColBtn key={col.name} name={col.name} selected={timeCol === col.name} disabled={col.name === eventCol} onClick={() => setTimeCol(col.name)} />)}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>{t("selector.eventCol")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
        {eventCols.map(col => <ColBtn key={col.name} name={col.name} selected={eventCol === col.name} disabled={col.name === timeCol} onClick={() => setEventCol(col.name)} />)}
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>{t("selector.groupColOptional")}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
        <ColBtn name={t("common.none")} selected={groupCol === null} onClick={() => setGroupCol(null)} colour="gray" />
        {categorical.map(col => <ColBtn key={col.name} name={col.name} selected={groupCol === col.name} onClick={() => setGroupCol(col.name)} colour="purple" />)}
      </div>

      <button onClick={() => canConfirm && onConfirm(timeCol!, eventCol!, groupCol ?? undefined)} disabled={!canConfirm}
        style={{ padding: "8px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: canConfirm ? "pointer" : "not-allowed", background: canConfirm ? "var(--accent)" : "var(--bg-alt)", color: canConfirm ? "var(--bg)" : "var(--text-muted)", border: "none", transition: "all 0.15s" }}>
        {t("common.runAnalysis")}
      </button>
    </motion.div>
  )
}