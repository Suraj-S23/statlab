/**
 * HomePage — the landing page at "/".
 * Full-screen 3D plot hero with minimal overlay text,
 * followed by a compact 3-step explainer section.
 */

import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import BivariatePlot from "../components/BivariatePlot.tsx"
import { useTheme } from "../contexts/ThemeContext.tsx"

const NAV_H = 52

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isDark } = useTheme()

  return (
    <>
      {/* ── Full-bleed hero ───────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: "100vh", minHeight: 620, overflow: "hidden" }}>

        {/* 3D plot fills the entire viewport */}
        <div style={{ position: "absolute", inset: 0 }}>
          <BivariatePlot />
        </div>

        {/* Top fade — nav readability */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 160,
          background: "linear-gradient(to bottom, rgba(3,7,18,0.75), transparent)",
          pointerEvents: "none", zIndex: 1,
        }} />

        {/* Focused gradient only behind the text block — rest of plot stays fully visible */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 70% at 13% 82%, rgba(3,7,18,0.90) 0%, rgba(3,7,18,0.50) 45%, transparent 72%)",
          pointerEvents: "none", zIndex: 1,
        }} />

        {/* Plot label — top right */}
        <div style={{
          position: "absolute", top: NAV_H + 12, right: 32, zIndex: 3,
          display: "flex", alignItems: "center", gap: 8,
          background: isDark ? "transparent" : "rgba(248,250,252,0.7)",
          backdropFilter: isDark ? "none" : "blur(8px)",
          padding: isDark ? "0" : "3px 10px", borderRadius: 6,
        }}>
          <span style={{
            background: "var(--accent-dim)", color: "var(--accent-text)",
            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
            textTransform: "uppercase" as const, letterSpacing: "0.08em",
            fontFamily: "var(--font-mono)", border: "1px solid rgba(45,212,191,0.2)",
          }}>
            {t("landing.plotType")}
          </span>
          <span style={{ color: "rgba(148,163,184,0.85)", fontSize: 10, fontFamily: "var(--font-mono)" }}>
            {t("landing.plotLabel")} · {t("landing.dragHint")}
          </span>
        </div>

        {/* Headline — anchored to bottom-left of hero */}
        <div style={{
          position: "absolute", bottom: "8%", left: 0, right: 0,
          zIndex: 2, pointerEvents: "none",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px" }}>
            <div style={{ maxWidth: 520, pointerEvents: "all" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(3,7,18,0.55)", border: "1px solid rgba(45,212,191,0.45)",
                backdropFilter: "blur(8px)", borderRadius: 20, padding: "4px 14px", marginBottom: 18,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
                <span style={{ color: "var(--accent-text)", fontSize: 10, fontWeight: 600, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                  {t("landing.badge")}
                </span>
              </div>

              <h1 style={{
                color: "#f1f5f9", fontFamily: "var(--font-sans)",
                fontSize: "clamp(32px, 3.6vw, 52px)", fontWeight: 700,
                lineHeight: 1.1, margin: "0 0 14px", letterSpacing: "-0.03em",
                textShadow: "0 2px 32px rgba(3,7,18,0.7)",
              }}>
                {t("landing.headline1")}<br />
                <span style={{ color: "var(--accent-text)" }}>{t("landing.headline2")}</span>
              </h1>

              <p style={{
                color: "rgba(226,232,240,0.90)", fontSize: 14, lineHeight: 1.65, maxWidth: 420,
                textShadow: "0 1px 14px rgba(3,7,18,1), 0 0 40px rgba(3,7,18,0.9)",
                marginBottom: 22,
              }}>
                {t("landing.subtitle")}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => navigate("/app")}
                  style={{
                    padding: "10px 22px", borderRadius: 9,
                    background: "var(--accent)", color: isDark ? "#000" : "#fff",
                    border: "none", cursor: "pointer", fontWeight: 700,
                    fontSize: 13, fontFamily: "var(--font-sans)",
                  }}
                >
                  Open App →
                </button>
                <button
                  onClick={() => navigate("/samples")}
                  style={{
                    padding: "10px 22px", borderRadius: 9,
                    background: "rgba(45,212,191,0.08)", color: "var(--accent-text)",
                    border: "1px solid rgba(45,212,191,0.25)",
                    cursor: "pointer", fontSize: 13, fontFamily: "var(--font-sans)",
                  }}
                >
                  Browse samples
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Below fold: 3-step explainer ─────────────────────────────────── */}
      <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "64px 32px 88px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" as const,
            marginBottom: 32, textAlign: "center",
          }}>
            How it works
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1, borderRadius: 12, overflow: "hidden",
            border: "1px solid var(--border)",
          }}>
            {([
              { step: "01", title: t("landing.steps.s1title"), desc: t("landing.steps.s1desc") },
              { step: "02", title: t("landing.steps.s2title"), desc: t("landing.steps.s2desc") },
              { step: "03", title: t("landing.steps.s3title"), desc: t("landing.steps.s3desc") },
            ]).map(({ step, title, desc }, i) => (
              <div key={step} style={{
                padding: "24px 22px", background: "var(--surface)",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ color: "var(--accent-text)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{step}</span>
                <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 12.5, margin: "7px 0 6px" }}>{title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: 11.5, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, textAlign: "center" }}>
            <button
              onClick={() => navigate("/methods")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: 11,
                fontFamily: "var(--font-mono)", textDecoration: "underline",
              }}
            >
              Read the statistical documentation →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {t("landing.footer")}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            FastAPI · React · Redis
          </span>
        </div>
      </footer>
    </>
  )
}