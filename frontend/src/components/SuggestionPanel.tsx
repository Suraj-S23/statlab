import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { getSuggestions } from "../services/api"
import type { UploadResponse, Suggestion } from "../types"

interface Props {
  data: UploadResponse
  onSelectTest: (test: string) => void
}

const TEST_ICONS: Record<string, string> = {
  "Descriptive Statistics":           "∑",
  "Independent t-test / Mann-Whitney U": "t",
  "One-Way ANOVA":                    "F",
  "Correlation (Pearson / Spearman)": "r",
  "Simple Linear Regression":         "β",
  "Chi-Square / Fisher's Exact Test": "χ²",
  "Dose-Response / IC50 Curve":       "IC",
  "Kaplan-Meier Survival Analysis":   "S(t)",
}

export default function SuggestionPanel({ data, onSelectTest }: Props) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuggestions(data.columns).then(setSuggestions).finally(() => setLoading(false))
  }, [data.columns])

  if (loading) return (
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ height: 90, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>
    </div>
  )

  const tier1 = suggestions.filter(s => s.tier === 1)
  const tier2 = suggestions.filter(s => s.tier === 2)

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>
          {t("suggestions.title")}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>
          {t("suggestions.subtitle")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 10 }}>
        {tier1.map((s, i) => (
          <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} />
        ))}
      </div>

      {tier2.length > 0 && (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "12px 0 8px", fontFamily: "var(--font-mono)" }}>
            {t("suggestions.advanced")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {tier2.map((s, i) => (
              <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} dim />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SuggestionCard({ suggestion, onClick, delay, dim }: { suggestion: Suggestion; onClick: () => void; delay: number; dim?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const icon = TEST_ICONS[suggestion.test] ?? "→"

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "left", padding: "13px 14px", borderRadius: 12,
        border: `1px solid ${hovered && !dim ? "var(--accent)" : "var(--border)"}`,
        background: hovered ? (dim ? "var(--card-hover)" : "var(--accent-dim)") : "var(--surface)",
        cursor: "pointer", transition: "all 0.15s", display: "flex", gap: 11, alignItems: "flex-start",
        opacity: dim ? 0.75 : 1, width: "100%",
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hovered && !dim ? "var(--accent-dim)" : "var(--bg-alt)",
        color: hovered && !dim ? "var(--accent-text)" : "var(--text-muted)",
        fontSize: 11, fontWeight: 700, transition: "all 0.15s",
        fontFamily: "var(--font-mono)", border: "1px solid var(--border)",
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 12, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {suggestion.test}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {suggestion.reason}
        </p>
      </div>
    </motion.button>
  )
}