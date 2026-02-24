import { useTranslation } from "react-i18next"
import type { TwoGroupResults as Results } from "../types"
import GroupBarChart from "./charts/GroupBarChart"

interface Props { results: Results; onBack: () => void }

function Badge({ significant }: { significant: boolean }) {
  const { t } = useTranslation()
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: significant ? "#052e16" : "var(--bg-alt)", color: significant ? "#4ade80" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{significant ? t("common.yes") : t("common.no")}</span>
}

export default function TwoGroupResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const groupNames = Object.keys(results.groups)
  const significant = results.t_test.significant || results.mann_whitney.significant
  const chartGroups = groupNames.map(name => ({ name, mean: results.groups[name].mean, std: results.groups[name].std, n: results.groups[name].n }))

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("twoGroup.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.value_column} by {results.group_column}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${significant ? "var(--accent)" : "var(--border)"}`, background: significant ? "var(--accent-dim)" : "var(--surface)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div id="chart-export-zone"><GroupBarChart groups={chartGroups} valueLabel={results.value_column} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16, marginTop: 16 }}>
        {groupNames.map(group => {
          const g = results.groups[group]
          return (
            <div key={group} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <p style={{ color: "var(--accent-text)", fontWeight: 600, fontSize: 13, margin: "0 0 10px", fontFamily: "var(--font-mono)" }}>{group}</p>
              {[
                [t("common.n"), g.n],
                [t("common.mean"), g.mean],
                [t("common.median"), g.median],
                [t("common.std"), g.std],
                [t("twoGroup.normality"), g.normality],
              ].map(([lbl, val]) => (
                <div key={String(lbl)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{lbl}</span>
                  <span style={{ color: val === "normal" ? "#4ade80" : val === "non-normal" ? "#f59e0b" : "var(--text)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{String(val)}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: "var(--surface)" }}>
            {[t("common.test"), t("common.statistic"), t("common.pValue"), t("common.significant"), ""].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[
              { name: t("twoGroup.tTest"), stat: results.t_test.statistic, p: results.t_test.p_value, sig: results.t_test.significant, rec: results.recommended_test === "t-test" },
              { name: t("twoGroup.mannWhitney"), stat: results.mann_whitney.statistic, p: results.mann_whitney.p_value, sig: results.mann_whitney.significant, rec: results.recommended_test === "Mann-Whitney U" },
            ].map(row => (
              <tr key={row.name} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>{row.name}</td>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{row.stat}</td>
                <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{row.p}</td>
                <td style={{ padding: "9px 14px" }}><Badge significant={row.sig} /></td>
                <td style={{ padding: "9px 14px" }}>{row.rec && <span style={{ fontSize: 10, color: "var(--accent-text)", fontFamily: "var(--font-mono)" }}>{t("common.recommended")}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}