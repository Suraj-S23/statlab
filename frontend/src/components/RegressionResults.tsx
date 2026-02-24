import { useTranslation } from "react-i18next"
import type { RegressionResults as Results } from "../types"
import ScatterPlot from "./charts/ScatterPlot"

interface Props { results: Results; onBack: () => void }

export default function RegressionResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("regression.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.outcome} ~ {results.predictor} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${results.significant ? "var(--accent)" : "var(--border)"}`, background: results.significant ? "var(--accent-dim)" : "var(--surface)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
        {[
          [t("regression.slope"), results.slope],
          [t("regression.intercept"), results.intercept],
          [t("regression.r2"), results.r_squared],
          [t("common.pValue"), results.p_value],
          [t("regression.r"), results.r_value],
          [t("regression.stdErr"), results.std_err],
          [t("common.n"), results.n],
          [t("common.significant"), results.significant ? t("common.yes") : t("common.no")],
        ].map(([lbl, val]) => (
          <div key={String(lbl)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 10, margin: "0 0 4px" }}>{lbl}</p>
            <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: 0, fontFamily: "var(--font-mono)" }}>{String(val)}</p>
          </div>
        ))}
      </div>

      {results.scatter?.length > 0 && (
        <ScatterPlot data={results.scatter} xLabel={results.predictor} yLabel={results.outcome} line={results.line} />
      )}
    </div>
  )
}