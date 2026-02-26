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
  "Descriptive Statistics":              "∑",
  "Independent t-test / Mann-Whitney U": "t",
  "One-Way ANOVA":                       "F",
  "Correlation (Pearson / Spearman)":    "r",
  "Simple Linear Regression":            "β",
  "Chi-Square / Fisher's Exact Test":    "χ²",
  "Dose-Response / IC50 Curve":          "IC",
  "Kaplan-Meier Survival Analysis":      "S(t)",
}

export default function SuggestionPanel({ data, onSelectTest }: Props) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuggestions(data.session_id, data.columns)
      .then(setSuggestions)
      .finally(() => setLoading(false))
  }, [data.session_id, data.columns])

  if (loading) return (
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ height: 90, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)", animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:.3} }`}</style>
    </div>
  )

  // Separate into: active tier1, warned tier1, disabled, tier2
  const tier1Active    = suggestions.filter(s => s.tier === 1 && !s.disabled && !s.warning)
  const tier1Warned    = suggestions.filter(s => s.tier === 1 && !s.disabled && s.warning)
  const tier1Disabled  = suggestions.filter(s => s.tier === 1 && s.disabled)
  const tier2          = suggestions.filter(s => s.tier === 2 && !s.disabled)
  const tier2Disabled  = suggestions.filter(s => s.tier === 2 && s.disabled)

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

      {/* Tier 1 — clean */}
      {tier1Active.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 8 }}>
          {tier1Active.map((s, i) => (
            <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Tier 1 — with warnings */}
      {tier1Warned.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 8 }}>
          {tier1Warned.map((s, i) => (
            <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Tier 1 — disabled */}
      {tier1Disabled.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 8 }}>
          {tier1Disabled.map((s, i) => (
            <SuggestionCard key={s.test} suggestion={s} onClick={() => {}} delay={i * 0.05} />
          ))}
        </div>
      )}

      {/* Tier 2 */}
      {(tier2.length > 0 || tier2Disabled.length > 0) && (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "12px 0 8px", fontFamily: "var(--font-mono)" }}>
            {t("suggestions.advanced")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {tier2.map((s, i) => (
              <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} dim />
            ))}
            {tier2Disabled.map((s, i) => (
              <SuggestionCard key={s.test} suggestion={s} onClick={() => {}} delay={i * 0.05} dim />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion, onClick, delay, dim,
}: {
  suggestion: Suggestion
  onClick: () => void
  delay: number
  dim?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const icon = TEST_ICONS[suggestion.test] ?? "→"
  const isDisabled = suggestion.disabled
  const hasWarning = !!suggestion.warning && !isDisabled

  const borderColor = isDisabled
    ? "var(--border)"
    : hovered && !dim
      ? hasWarning ? "#f59e0b" : "var(--accent)"
      : "var(--border)"

  const bgColor = isDisabled
    ? "var(--surface)"
    : hovered
      ? dim ? "var(--card-hover)" : hasWarning ? "rgba(245,158,11,0.07)" : "var(--accent-dim)"
      : "var(--surface)"

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={isDisabled ? {} : { y: -2 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "left", padding: "13px 14px", borderRadius: 12,
        border: `1px solid ${borderColor}`,
        background: bgColor,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 8,
        opacity: isDisabled ? 0.45 : dim ? 0.75 : 1,
        width: "100%",
      }}
    >
      {/* Top row: icon + test name */}
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: hovered && !dim && !isDisabled
            ? hasWarning ? "rgba(245,158,11,0.15)" : "var(--accent-dim)"
            : "var(--bg-alt)",
          color: hovered && !dim && !isDisabled
            ? hasWarning ? "#f59e0b" : "var(--accent-text)"
            : "var(--text-muted)",
          fontSize: 11, fontWeight: 700, transition: "all 0.15s",
          fontFamily: "var(--font-mono)", border: "1px solid var(--border)",
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 12, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {suggestion.test}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {suggestion.reason}
          </p>
        </div>
      </div>

      {/* Warning banner */}
      {suggestion.warning && (
        <div style={{
          display: "flex", gap: 6, alignItems: "flex-start",
          padding: "6px 8px", borderRadius: 7,
          background: isDisabled ? "rgba(148,163,184,0.08)" : "rgba(245,158,11,0.1)",
          border: `1px solid ${isDisabled ? "rgba(148,163,184,0.15)" : "rgba(245,158,11,0.25)"}`,
        }}>
          <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>
            {isDisabled ? "🚫" : "⚠️"}
          </span>
          <p style={{
            color: isDisabled ? "var(--text-muted)" : "#f59e0b",
            fontSize: 10, margin: 0, lineHeight: 1.45,
          }}>
            {suggestion.warning}
          </p>
        </div>
      )}
    </motion.button>
  )
}