import { useTranslation } from "react-i18next"
import type { AnovaResults as Results } from "../types"
import BoxPlotChart from "./charts/BoxPlotChart"

interface Props { results: Results; onBack: () => void }

function Badge({ significant }: { significant: boolean }) {
  const { t } = useTranslation()
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: significant ? "#052e16" : "var(--bg-alt)", color: significant ? "#4ade80" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{significant ? t("common.yes") : t("common.no")}</span>
}

export default function AnovaResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const groupNames = Object.keys(results.groups)
  const significant = results.anova.significant || results.kruskal_wallis.significant
  const chartGroups = groupNames.map(name => ({
    name,
    mean:         results.groups[name].mean,
    median:       results.groups[name].median,
    std:          results.groups[name].std,
    q1:           results.groups[name].q1,
    q3:           results.groups[name].q3,
    whisker_low:  results.groups[name].whisker_low,
    whisker_high: results.groups[name].whisker_high,
    points:       results.groups[name].points,
    n:            results.groups[name].n,
  }))

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>{t("anova.title")}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.value_column} by {results.group_column} · {results.n_groups} {t("anova.groups")}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${significant ? "var(--accent)" : "var(--border)"}`, background: significant ? "var(--accent-dim)" : "var(--surface)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div id="chart-export-zone"><BoxPlotChart groups={chartGroups} valueLabel={results.value_column} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 16, marginTop: 16 }}>
        {groupNames.map(group => {
          const g = results.groups[group]
          return (
            <div key={group} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <p style={{ color: "var(--accent-text)", fontWeight: 600, fontSize: 11, margin: "0 0 8px", fontFamily: "var(--font-mono)" }}>{group}</p>
              {[[t("common.n"), g.n], [t("common.mean"), g.mean], [t("common.std"), g.std]].map(([lbl, val]) => (
                <div key={String(lbl)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{lbl}</span>
                  <span style={{ color: "var(--text)", fontSize: 10, fontFamily: "var(--font-mono)" }}>{String(val)}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: "var(--surface)" }}>
            {[t("common.test"), t("common.statistic"), t("common.pValue"), t("common.significant")].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>{t("anova.oneWay")}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>F = {results.anova.f_statistic}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.anova.p_value}</td>
              <td style={{ padding: "9px 14px" }}><Badge significant={results.anova.significant} /></td>
            </tr>
            <tr style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>{t("anova.kruskal")}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>H = {results.kruskal_wallis.h_statistic}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.kruskal_wallis.p_value}</td>
              <td style={{ padding: "9px 14px" }}><Badge significant={results.kruskal_wallis.significant} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}