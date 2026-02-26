/**
 * SamplesPage — curated demo dataset gallery at "/samples".
 * Each card navigates to /app, where the user can pick and load the sample.
 */
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const NAV_H = 52

const SAMPLES = [
  {
    id: "clinical",
    title: "Clinical Trial",
    desc: "Blood-pressure drug vs placebo in 80 patients.\nCompare groups, test response rates.",
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
    desc: "Immunotherapy vs chemotherapy in 90 patients.\nEstimate and compare survival curves.",
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
] as const

export default function SamplesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div style={{ paddingTop: NAV_H + 28, maxWidth: 980, margin: "0 auto" }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
        {t("samples.kicker")}
      </p>

      <h1 style={{ margin: "0 0 10px 0" }}>{t("samples.title")}</h1>

      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
        {t("samples.subtitle")}
      </p>

      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {SAMPLES.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate("/app")}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "22px 24px",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--accent)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "var(--border)")
            }
          >
            {/* Icon row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: s.accent,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {s.title[0]}
              </div>

              <div style={{ color: "var(--accent-text)", fontSize: 12 }}>
                {t("samples.openInApp")}
              </div>
            </div>

            <h3 style={{ margin: "0 0 6px 0" }}>{s.title}</h3>

            <p style={{ margin: 0, color: "var(--text-muted)", whiteSpace: "pre-line" }}>
              {s.desc}
            </p>

            {/* Tags */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
              {t("samples.heroLabel")} {s.hero}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 26, color: "var(--text-muted)", fontSize: 12 }}>
        LabRat — statistical analysis for researchers FastAPI · React · Redis
      </div>
    </div>
  )
}