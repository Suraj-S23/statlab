/**
 * DescriptiveResults — summary statistics table + histograms, theme-aware.
 */
import type { DescriptiveResults as Results } from "../types"
import Histogram from "./charts/Histogram"

interface Props { results: Results; onBack: () => void }

const STATS = [
  { key: "count", label: "Count" }, { key: "mean", label: "Mean" },
  { key: "median", label: "Median" }, { key: "std", label: "Std Dev" },
  { key: "min", label: "Min" }, { key: "max", label: "Max" },
  { key: "q1", label: "Q1 (25%)" }, { key: "q3", label: "Q3 (75%)" },
  { key: "iqr", label: "IQR" }, { key: "skewness", label: "Skewness" },
  { key: "kurtosis", label: "Kurtosis" }, { key: "outliers", label: "Outliers" },
]

export default function DescriptiveResults({ results, onBack }: Props) {
  const columns = Object.keys(results)
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: 0 }}>Descriptive Statistics</h3>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--surface)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>Statistic</th>
              {columns.map(col => <th key={col} style={{ padding: "10px 14px", textAlign: "left", color: "var(--accent-text)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
           {STATS.map(({ key, label }) => (
            <tr key={key} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "8px 14px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{label}</td>
              {columns.map(col => {
                const val = results[col][key as keyof typeof results[typeof col]]
                return (
                  <td key={col} style={{ padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {key === "outliers" && (val as number) > 0
                      ? <span style={{ color: "#f59e0b" }}>{String(val)}</span>
                      : <span style={{ color: "var(--text)" }}>{String(val)}</span>}
                  </td>
                )
              })}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {columns.map(col => (
          results[col].histogram?.length > 0 && (
            <div key={col} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <Histogram data={results[col].histogram} title={`Distribution — ${col}`} />
            </div>
          )
        ))}
      </div>
    </div>
  )
}