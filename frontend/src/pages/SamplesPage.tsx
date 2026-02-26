/**
 * SamplesPage — curated demo dataset gallery at "/samples".
 * Each card navigates to /app, where the user can pick and load the sample.
 */

import { useNavigate } from "react-router-dom"

const NAV_H = 52

const SAMPLES = [
  {
    id: "clinical",
    title: "Clinical Trial",
    desc: "Blood-pressure drug vs placebo in 80 patients. Compare groups, test response rates.",
    tags: ["t-test", "Chi-square", "Descriptive"],
    hero: "Independent t-test / Mann-Whitney U",
    accent: "rgba(45,212,191,0.12)",
  },
  {
    id: "dose",
    title: "Dose-Response / IC50",
    desc: "Cell viability across 11 compound concentrations (4 replicates). Fit a 4PL curve.",
    tags: ["Dose-Response", "IC50"],
    hero: "Dose-Response / IC50 Curve",
    accent: "rgba(99,102,241,0.12)",
  },
  {
    id: "survival",
    title: "Cancer Survival Study",
    desc: "Immunotherapy vs chemotherapy in 90 patients. Estimate and compare survival curves.",
    tags: ["Kaplan-Meier", "Log-rank test"],
    hero: "Kaplan-Meier Survival Analysis",
    accent: "rgba(251,146,60,0.12)",
  },
  {
    id: "diet",
    title: "Diet Intervention",
    desc: "Cholesterol and weight changes across 4 diet groups in 100 participants.",
    tags: ["ANOVA", "Correlation", "Regression"],
    hero: "One-Way ANOVA",
    accent: "rgba(52,211,153,0.12)",
  },
]

export default function SamplesPage() {
  const navigate = useNavigate()

  return (
    <>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: `${NAV_H + 48}px 32px 80px` }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            Demo datasets
          </p>
          <h1 style={{
            color: "var(--text)", fontWeight: 700, fontSize: 28,
            margin: "0 0 10px", letterSpacing: "-0.3px",
          }}>
            Samples
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, maxWidth: 480, margin: 0 }}>
            Each dataset is curated to demonstrate one analysis end-to-end. Click a card to go to the
            app — then select the matching sample to load it instantly.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {SAMPLES.map(s => (
            <div
              key={s.id}
              onClick={() => navigate("/app")}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "22px 24px", cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}
            >
              {/* Icon row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: s.accent, border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {/* Simple monogram letter as icon */}
                  <span style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>
                    {s.title[0]}
                  </span>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent-text)",
                  background: "var(--accent-dim)", borderRadius: 5, padding: "2px 8px",
                  border: "1px solid rgba(45,212,191,0.15)",
                }}>
                  Open in App →
                </span>
              </div>

              <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6, margin: "0 0 14px" }}>{s.desc}</p>

              {/* Tags */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 14 }}>
                {s.tags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "var(--text-muted)", background: "var(--bg-alt)",
                    border: "1px solid var(--border)", borderRadius: 4, padding: "2px 7px",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)", margin: 0 }}>
                  Hero analysis: <span style={{ color: "var(--accent-text)" }}>{s.hero}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>LabRat — statistical analysis for researchers</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>FastAPI · React · Redis</span>
        </div>
      </footer>
    </>
  )
}