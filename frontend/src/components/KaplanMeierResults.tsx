import { useTranslation } from "react-i18next"
import type { KaplanMeierResults as Results } from "../types"
import SurvivalCurve from "./charts/SurvivalCurve"

interface Props { results: Results; onBack: () => void }

export default function KaplanMeierResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const hasGroups = results.groups !== undefined
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("kaplanMeier.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{t("kaplanMeier.time")}: {results.time_col} · {t("kaplanMeier.event")}: {results.event_col} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid var(--accent)", background: "var(--accent-dim)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <SurvivalCurve curve={results.curve} groups={results.groups} />
      {!hasGroups && (
        <div style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", display: "inline-block", marginTop: 16 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: "0 0 4px" }}>{t("kaplanMeier.medianSurvival")}</p>
          <p style={{ color: "var(--text)", fontWeight: 700, fontSize: 20, margin: 0, fontFamily: "var(--font-mono)" }}>{results.median_survival ?? t("kaplanMeier.notReached")}</p>
        </div>
      )}
      {hasGroups && results.groups && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginTop: 16 }}>
          {Object.entries(results.groups).map(([group, data]) => (
            <div key={group} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <p style={{ color: "var(--accent-text)", fontWeight: 600, fontSize: 12, margin: "0 0 10px", fontFamily: "var(--font-mono)" }}>{group}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{t("common.n")}</span>
                <span style={{ color: "var(--text)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{data.n}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{t("kaplanMeier.medianSurvivalShort")}</span>
                <span style={{ color: "var(--text)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{data.median_survival ?? t("kaplanMeier.notReached")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}