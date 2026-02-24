import { useTranslation } from "react-i18next"
import type { DoseResponseResults as Results } from "../types"
import DoseResponseChart from "./charts/DoseResponseChart"

interface Props { results: Results; onBack: () => void }

export default function DoseResponseResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const statCards = [
    [t("doseResponse.ic50"),      results.ic50],
    [t("doseResponse.hillSlope"), results.hill_slope],
    [t("doseResponse.bottom"),    results.bottom],
    [t("doseResponse.top"),       results.top],
    [t("doseResponse.r2"),        results.r_squared],
    [t("common.n"),               results.n],
  ]
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("doseResponse.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.response_col} ~ {results.concentration_col} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${results.r_squared > 0.9 ? "var(--accent)" : "#92400e"}`, background: results.r_squared > 0.9 ? "var(--accent-dim)" : "#1c0a00", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
        {statCards.map(([lbl, val]) => (
          <div key={String(lbl)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 10, margin: "0 0 4px" }}>{lbl}</p>
            <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: 0, fontFamily: "var(--font-mono)" }}>{String(val)}</p>
          </div>
        ))}
      </div>
      {results.curve_x?.length > 0 && (
        <DoseResponseChart curveX={results.curve_x} curveY={results.curve_y} dataX={results.data_x} dataY={results.data_y} xLabel={results.concentration_col} yLabel={results.response_col} />
      )}
    </div>
  )
}