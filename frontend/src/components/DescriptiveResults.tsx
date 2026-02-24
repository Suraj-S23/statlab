import { useTranslation } from "react-i18next"
import type { DescriptiveResults as Results } from "../types"
import Histogram from "./charts/Histogram"

interface Props { results: Results; onBack: () => void }

export default function DescriptiveResults({ results, onBack }: Props) {
  const { t } = useTranslation()
  const columns = Object.keys(results)

  const STATS = [
    { key: "count",    label: t("descriptive.count") },
    { key: "mean",     label: t("descriptive.mean") },
    { key: "median",   label: t("descriptive.median") },
    { key: "std",      label: t("descriptive.std") },
    { key: "min",      label: t("descriptive.min") },
    { key: "max",      label: t("descriptive.max") },
    { key: "q1",       label: t("descriptive.q1") },
    { key: "q3",       label: t("descriptive.q3") },
    { key: "iqr",      label: t("descriptive.iqr") },
    { key: "skewness", label: t("descriptive.skewness") },
    { key: "kurtosis", label: t("descriptive.kurtosis") },
    { key: "outliers", label: t("descriptive.outliers") },
  ]

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>{t("descriptive.title")}</h3>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>{t("common.back")}</button>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{t("descriptive.statistic")}</th>
              {columns.map(col => <th key={col} style={{ padding: "10px 14px", textAlign: "left", color: "var(--accent-text)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {STATS.map(({ key, label }) => (
              <tr key={key} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 14px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{label}</td>
                {columns.map(col => (
                  <td key={col} style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {key === "outliers" && (results[col] as unknown as Record<string, number>)[key] > 0
                      ? <span style={{ color: "#f59e0b" }}>{(results[col] as unknown as Record<string, number>)[key]}</span>
                      : <span style={{ color: "var(--text)" }}>{String((results[col] as unknown as Record<string, number | string>)[key])}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {columns.map(col => (
          results[col].histogram?.length > 0 && (
            <div key={col} style={{ padding: "14px 16px 4px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", overflow: "visible" }}>
              <Histogram data={results[col].histogram} title={`${t("descriptive.distribution")} — ${col}`} />
            </div>
          )
        ))}
      </div>
    </div>
  )
}