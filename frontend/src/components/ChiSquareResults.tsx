import { useTranslation } from "react-i18next"
import type { ChiSquareResults as Results } from "../types"
import ContingencyChart from "./charts/ContingencyChart"

interface Props { results: Results; onBack: () => void }

function Badge({ significant }: { significant: boolean }) {
  const { t } = useTranslation()
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: significant ? "#052e16" : "var(--bg-alt)", color: significant ? "#4ade80" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
      {significant ? t("common.yes") : t("common.no")}
    </span>
  )
}

export default function ChiSquareResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const significant = results.chi_square.significant || results.fisher?.significant
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("chiSquare.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.col_a} × {results.col_b} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${significant ? "var(--accent)" : "var(--border)"}`, background: significant ? "var(--accent-dim)" : "var(--surface)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      {results.assumption_warning && (
        <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #92400e", background: "#1c0a00", marginBottom: 16 }}>
          <p style={{ color: "#fbbf24", fontSize: 11, margin: 0, lineHeight: 1.5 }}>⚠ {results.assumption_warning}</p>
        </div>
      )}

      {results.contingency_table && (
        <ContingencyChart table={results.contingency_table} rowLabel={results.col_a} colLabel={results.col_b} />
      )}

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)", marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: "var(--surface)" }}>
            {[t("common.test"), t("common.statistic"), t("common.pValue"), t("common.significant")].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>{t("chiSquare.chiSquare")} ({t("chiSquare.dof")}={results.chi_square.dof})</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>χ² = {results.chi_square.statistic}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.chi_square.p_value}</td>
              <td style={{ padding: "9px 14px" }}><Badge significant={results.chi_square.significant} /></td>
            </tr>
            {results.fisher && (
              <tr style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>{t("chiSquare.fisher")}</td>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{t("chiSquare.oddsRatio")} = {results.fisher.odds_ratio}</td>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.fisher.p_value}</td>
                <td style={{ padding: "9px 14px" }}><Badge significant={results.fisher.significant} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}