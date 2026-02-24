/**
 * CorrelationResults — Pearson/Spearman display, theme-aware.
 */
import type { CorrelationResults as Results } from "../types"
interface Props { results: Results; onBack: () => void }
function Badge({ significant }: { significant: boolean }) {
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: significant ? "#052e16" : "var(--bg-alt)", color: significant ? "#4ade80" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{significant ? "Yes" : "No"}</span>
}
export default function CorrelationResults({ results, onBack }: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>Correlation Analysis</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.col_a} vs {results.col_b} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${results.pearson.significant ? "var(--accent)" : "var(--border)"}`, background: results.pearson.significant ? "var(--accent-dim)" : "var(--surface)", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: "var(--surface)" }}>
            {["Test", "Coefficient", "p-value", "Significant"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>Pearson r</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.pearson.r}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.pearson.p_value}</td>
              <td style={{ padding: "9px 14px" }}><Badge significant={results.pearson.significant} /></td>
            </tr>
            <tr style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12 }}>Spearman ρ</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.spearman.rho}</td>
              <td style={{ padding: "9px 14px", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-mono)" }}>{results.spearman.p_value}</td>
              <td style={{ padding: "9px 14px" }}><Badge significant={results.spearman.significant} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
