/**
 * DoseResponseResults — IC50 curve display, theme-aware.
 */
import type { DoseResponseResults as Results } from "../types"
interface Props { results: Results; onBack: () => void }
export default function DoseResponseResults({ results, onBack }: Props) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 3px" }}>Dose-Response / IC50</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)" }}>{results.response_col} ~ {results.concentration_col} · n = {results.n}</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>← Back</button>
      </div>
      <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${results.r_squared > 0.9 ? "var(--accent)" : "#92400e"}`, background: results.r_squared > 0.9 ? "var(--accent-dim)" : "#1c0a00", marginBottom: 16 }}>
        <p style={{ color: "var(--text)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{results.interpretation}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {[["IC50", results.ic50], ["Hill Slope", results.hill_slope], ["Bottom", results.bottom], ["Top", results.top], ["R²", results.r_squared], ["n", results.n]].map(([lbl, val]) => (
          <div key={String(lbl)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 10, margin: "0 0 4px" }}>{lbl}</p>
            <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: 0, fontFamily: "var(--font-mono)" }}>{String(val)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
