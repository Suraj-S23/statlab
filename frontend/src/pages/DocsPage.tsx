/**
 * DocsPage — practical usage docs at "/docs".
 * Accordion sections covering CSV format, column types, missing values,
 * exports, session lifecycle, and troubleshooting.
 */

import { useState } from "react"

const NAV_H = 52

const SECTIONS = [
  {
    title: "CSV format",
    desc: "What LabRat expects from your file",
    content: [
      "Header row required (row 1) — column names must not be blank",
      "UTF-8 or ASCII encoding, comma-separated (.csv only)",
      "No minimum row count, but most tests need at least 10 rows",
      "Mixed-type columns are inferred as categorical",
      "High-cardinality columns (> 20 unique values) are excluded from Chi-square suggestions",
    ],
  },
  {
    title: "Column type inference",
    desc: "How numeric, categorical, and boolean types are detected",
    content: [
      "Boolean: unique values are a subset of {true, false, 0, 1}",
      "Numeric: parseable as a pandas numeric dtype",
      "Categorical: everything else (strings, mixed, high-cardinality numbers)",
      "Type override is not currently supported — recode your column before upload",
    ],
  },
  {
    title: "Missing values",
    desc: "How NaN values are handled per analysis",
    content: [
      "Descriptive stats: NaNs excluded per column; count shown in summary",
      "t-test / ANOVA: NaNs excluded per group before testing",
      "Correlation / Regression: pairwise complete cases",
      "Kaplan-Meier: rows with NaN in the time or event column are dropped entirely",
      "Columns with > 50% missing values are flagged in Data Preview",
    ],
  },
  {
    title: "Export formats",
    desc: "What each download option produces",
    content: [
      "PNG — chart only, 2× resolution, transparent background",
      "PDF — chart + stats table + plain-English interpretation, A4 landscape",
      "CSV — raw numeric results as returned by the backend analysis endpoint",
    ],
  },
  {
    title: "Session & data lifecycle",
    desc: "How long your data stays on the server",
    content: [
      "Your CSV is uploaded to the backend and stored in Redis with a 2-hour TTL",
      "When the TTL expires, the data is deleted automatically — no manual cleanup needed",
      "There is no persistent database; no data survives a server restart",
      "No analytics are run on file contents",
      "See the Privacy page for full details",
    ],
  },
  {
    title: "Troubleshooting",
    desc: "Common errors and how to fix them",
    content: [
      "'Dose-response did not converge' → ensure your concentration spans at least 2 orders of magnitude",
      "'ANOVA: group skipped' → one or more groups had n < 3 and were excluded automatically",
      "'Session not found' → your 2-hour session expired; re-upload your file to continue",
      "'Only CSV files are supported' → convert .xlsx to .csv first (File → Save As in Excel)",
      "Results look wrong → check that your grouping column has the right data type (categorical / boolean, not numeric)",
    ],
  },
]

export default function DocsPage() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: `${NAV_H + 48}px 32px 80px` }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            Usage guide
          </p>
          <h1 style={{ color: "var(--text)", fontWeight: 700, fontSize: 28, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
            Docs
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, maxWidth: 460, margin: 0 }}>
            CSV requirements, column handling, exports, session lifecycle, and troubleshooting.
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SECTIONS.map(s => (
            <div
              key={s.title}
              style={{
                background: "var(--surface)",
                border: `1px solid ${open === s.title ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10, overflow: "hidden", transition: "border-color 0.15s",
              }}
            >
              <button
                onClick={() => setOpen(open === s.title ? null : s.title)}
                style={{
                  width: "100%", padding: "14px 18px", background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 12.5, margin: "0 0 2px" }}>{s.title}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{s.desc}</p>
                </div>
                <span style={{
                  color: "var(--text-muted)", fontSize: 13,
                  display: "block", transform: open === s.title ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}>
                  ▾
                </span>
              </button>

              {open === s.title && (
                <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--border)" }}>
                  <ul style={{ margin: "12px 0 0", padding: "0 0 0 16px" }}>
                    {s.content.map(c => (
                      <li key={c} style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.7, marginBottom: 4 }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>LabRat — statistical analysis for researchers</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>FastAPI · React · Redis</span>
        </div>
      </footer>
    </>
  )
}