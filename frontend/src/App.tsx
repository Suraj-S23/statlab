/**
 * App — root component.
 * - LabRat branding
 * - Centered layout with interactive 3D Bivariate Density on landing page
 * - Obsidian / Arctic Light theme toggle
 * - Language switcher (EN / DE / FR)
 * - Framer Motion page transitions
 */

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import i18n from "./i18n/index"
import { useTheme } from "./contexts/ThemeContext"
import UploadZone from "./components/UploadZone"
import DataPreview from "./components/DataPreview"
import SuggestionPanel from "./components/SuggestionPanel"
import ColumnSelector from "./components/ColumnSelector"
import TwoGroupSelector from "./components/TwoGroupSelector"
import TwoNumericSelector from "./components/TwoNumericSelector"
import KaplanMeierSelector from "./components/KaplanMeierSelector"
import DescriptiveResults from "./components/DescriptiveResults"
import TwoGroupResults from "./components/TwoGroupResults"
import AnovaResults from "./components/AnovaResults"
import CorrelationResults from "./components/CorrelationResults"
import RegressionResults from "./components/RegressionResults"
import ChiSquareResults from "./components/ChiSquareResults"
import DoseResponseResults from "./components/DoseResponseResults"
import KaplanMeierResults from "./components/KaplanMeierResults"
import {
  runDescriptive, runTwoGroup, runAnova, runCorrelation,
  runRegression, runChiSquare, runDoseResponse, runKaplanMeier,
} from "./services/api"
import type {
  UploadResponse,
  DescriptiveResults as DescResults,
  TwoGroupResults as TwoResults,
  AnovaResults as AnovaRes,
  CorrelationResults as CorrRes,
  RegressionResults as RegRes,
  ChiSquareResults as ChiRes,
  DoseResponseResults as DoseRes,
  KaplanMeierResults as KMRes,
} from "./types"

type AnyResults =
  | { type: "descriptive"; data: DescResults }
  | { type: "two-group"; data: TwoResults }
  | { type: "anova"; data: AnovaRes }
  | { type: "correlation"; data: CorrRes }
  | { type: "regression"; data: RegRes }
  | { type: "chi-square"; data: ChiRes }
  | { type: "dose-response"; data: DoseRes }
  | { type: "kaplan-meier"; data: KMRes }

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

// ── Interactive 3D Bivariate Normal Density ──────────────────────────────────

function Bivariateplot() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const angleRef = useRef(0.35)
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const { isDark } = useTheme()

  const r = 0.72
  const bivnorm = useCallback((x: number, y: number) => {
    const z = (x * x - 2 * r * x * y + y * y) / (1 - r * r)
    return Math.exp(-z / 2) / (2 * Math.PI * Math.sqrt(1 - r * r))
  }, [])

  const scatterRef = useRef<{ x: number; y: number }[]>([])
  useEffect(() => {
    const pts: { x: number; y: number }[] = []
    const seed = (n: number) => {
      const x = Math.sin(n * 127.1) * 43758.5453
      return x - Math.floor(x)
    }
    for (let i = 0; i < 180; i++) {
      const u1 = seed(i * 2), u2 = seed(i * 2 + 1)
      const z1 = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
      const z2 = Math.sqrt(-2 * Math.log(Math.max(u2, 1e-10))) * Math.cos(2 * Math.PI * u1)
      const x = z1 * 1.1
      const y = (r * z1 + Math.sqrt(1 - r * r) * z2) * 1.1
      if (Math.abs(x) < 2.8 && Math.abs(y) < 2.8) pts.push({ x, y })
    }
    scatterRef.current = pts
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
    }
    resize()

    const maxDensity = bivnorm(0, 0)
    const GRID = 34
    const RANGE = 2.8
    const accentRgb = isDark ? [45, 212, 191] : [3, 105, 161]

    const project = (x: number, y: number, z: number) => {
      const cosA = Math.cos(angleRef.current), sinA = Math.sin(angleRef.current)
      const rx = x * cosA - z * sinA
      const rz = x * sinA + z * cosA
      const tilt = 0.46
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
      const ry = y * cosT - rz * sinT
      const rz2 = y * sinT + rz * cosT
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      const fov = 5
      const s = fov / (fov + rz2 * 0.3 + 2.5)
      return { sx: W * 0.5 + rx * s * W * 0.26, sy: H * 0.50 - ry * s * H * 0.36, depth: rz2 }
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")!
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = isDark ? "#060a0e" : "#eef6ff"
      ctx.fillRect(0, 0, W, H)

      const [ar, ag, ab] = accentRgb

      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.06 : 0.1})`
      ctx.lineWidth = 0.5
      for (let i = -4; i <= 4; i++) {
        const a = project(i * 0.7, 0, -RANGE), b = project(i * 0.7, 0, RANGE)
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke()
        const c = project(-RANGE, 0, i * 0.7), d = project(RANGE, 0, i * 0.7)
        ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(d.sx, d.sy); ctx.stroke()
      }

      const cells: { pts: { sx: number; sy: number }[]; depth: number; density: number }[] = []
      for (let iz = 0; iz < GRID - 1; iz++) {
        for (let ix = 0; ix < GRID - 1; ix++) {
          const x0 = -RANGE + (ix / (GRID - 1)) * RANGE * 2
          const z0 = -RANGE + (iz / (GRID - 1)) * RANGE * 2
          const x1 = -RANGE + ((ix + 1) / (GRID - 1)) * RANGE * 2
          const z1 = -RANGE + ((iz + 1) / (GRID - 1)) * RANGE * 2
          const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
          const density = bivnorm(cx, cz) / maxDensity

          const h = (x: number, z: number) => (bivnorm(x, z) / maxDensity) * 1.6
          const p00 = project(x0, h(x0, z0), z0)
          const p10 = project(x1, h(x1, z0), z0)
          const p11 = project(x1, h(x1, z1), z1)
          const p01 = project(x0, h(x0, z1), z1)
          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4
          cells.push({ pts: [p00, p10, p11, p01], depth: avgDepth, density })
        }
      }
      cells.sort((a, b) => b.depth - a.depth)

      cells.forEach(({ pts, density }) => {
        const alpha = isDark ? 0.1 + density * 0.65 : 0.12 + density * 0.55
        const bright = 0.25 + density * 0.75
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha * bright})`
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${alpha * 0.12})`
        ctx.lineWidth = 0.35
        ctx.beginPath()
        ctx.moveTo(pts[0].sx, pts[0].sy)
        pts.slice(1).forEach(p => ctx.lineTo(p.sx, p.sy))
        ctx.closePath(); ctx.fill(); ctx.stroke()
      })

      scatterRef.current.forEach(p => {
        const fp = project(p.x, 0.01, p.y)
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.38 : 0.5})`
        ctx.beginPath()
        ctx.arc(fp.sx, fp.sy, 1.8, 0, Math.PI * 2)
        ctx.fill()
      })

      const peak = project(0, 1.7, 0)
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.9)`
      ctx.font = `600 11px 'IBM Plex Sans', sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(`r = ${r}`, peak.sx, peak.sy - 6)

      ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.3 : 0.45})`
      ctx.font = `10px 'IBM Plex Mono', monospace`
      const xLbl = project(2.4, 0, 0)
      ctx.textAlign = "left"
      ctx.fillText("X₁", xLbl.sx, xLbl.sy)
      const yLbl = project(0, 0, 2.4)
      ctx.fillText("X₂", yLbl.sx, yLbl.sy)

      ctx.fillStyle = `rgba(${ar},${ag},${ab},${isDark ? 0.18 : 0.25})`
      ctx.font = `9px 'IBM Plex Mono', monospace`
      ctx.textAlign = "right"
      ctx.fillText("f(x₁,x₂) — Bivariate Normal · Pearson correlation", W - 10, H - 10)

      if (!isDragging.current) {
        ctx.fillStyle = `rgba(${ar},${ag},${ab},0.25)`
        ctx.font = `9px 'IBM Plex Sans', sans-serif`
        ctx.textAlign = "left"
        ctx.fillText("drag to rotate", 12, H - 10)
      }

      if (!isDragging.current) {
        angleRef.current += 0.003
      }
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [isDark, bivnorm])

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastX.current = e.clientX }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    angleRef.current += (lastX.current - e.clientX) * 0.008
    lastX.current = e.clientX
  }
  const onMouseUp = () => { isDragging.current = false }
  const onTouchStart = (e: React.TouchEvent) => { isDragging.current = true; lastX.current = e.touches[0].clientX }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    angleRef.current += (e.touches[0].clientX - lastX.current) * 0.008
    lastX.current = e.touches[0].clientX
  }
  const onTouchEnd = () => { isDragging.current = false }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  )
}

// ── Theme toggle ──────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Arctic Light" : "Switch to Obsidian"}
      style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontSize: 16 }}
    >
      {isDark ? "☀" : "◑"}
    </button>
  )
}

// ── Language switcher ─────────────────────────────────────────────────────────

const LANGS = ["en", "de", "fr"] as const
type Lang = typeof LANGS[number]

function LanguageSwitcher() {
  const { isDark } = useTheme()
  const [lang, setLang] = useState<Lang>(
    (localStorage.getItem("labrat-lang") as Lang) ?? "en"
  )
  const changeLang = (l: Lang) => {
    i18n.changeLanguage(l)
    localStorage.setItem("labrat-lang", l)
    setLang(l)
  }
  return (
    <div style={{ display: "flex", gap: 2, background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)", padding: 2 }}>
      {LANGS.map(l => (
        <button key={l} onClick={() => changeLang(l)} style={{
          padding: "3px 9px", borderRadius: 6, border: "none", cursor: "pointer",
          fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
          background: lang === l ? "var(--accent)" : "transparent",
          color: lang === l ? (isDark ? "#000" : "#fff") : "var(--text-muted)",
          transition: "all 0.15s",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const [data, setData] = useState<UploadResponse | null>(null)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [results, setResults] = useState<AnyResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function runAnalysis<T>(fn: () => Promise<T>, type: AnyResults["type"]) {
    setLoading(true)
    setError("")
    try {
      const result = await fn()
      setResults({ type, data: result } as AnyResults)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setData(null); setSelectedTest(null); setResults(null); setError("") }
  const handleBackToSuggestions = () => { setSelectedTest(null); setResults(null); setError("") }

  const renderResults = () => {
    if (!results) return null
    const props = { onBack: handleBackToSuggestions }
    switch (results.type) {
      case "descriptive":   return <DescriptiveResults results={results.data} {...props} />
      case "two-group":     return <TwoGroupResults results={results.data} {...props} />
      case "anova":         return <AnovaResults results={results.data} {...props} />
      case "correlation":   return <CorrelationResults results={results.data} {...props} />
      case "regression":    return <RegressionResults results={results.data} {...props} />
      case "chi-square":    return <ChiSquareResults results={results.data} {...props} />
      case "dose-response": return <DoseResponseResults results={results.data} {...props} />
      case "kaplan-meier":  return <KaplanMeierResults results={results.data} {...props} />
    }
  }

  const renderSelector = () => {
    if (!data) return null
    if (loading) return (
      <motion.div variants={pageVariants} initial="initial" animate="animate"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 48 }}>
        <div style={{ width: 28, height: 28, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("common.runningAnalysis")}</p>
      </motion.div>
    )

    switch (selectedTest) {
      case "Descriptive Statistics":
        return <ColumnSelector columns={data.columns} filterType="numeric"
          onConfirm={(cols) => runAnalysis(() => runDescriptive(data.session_id, cols), "descriptive")}
          onBack={handleBackToSuggestions} minSelect={1} />

      case "Independent t-test / Mann-Whitney U":
        return <TwoGroupSelector columns={data.columns}
          onConfirm={(g, v) => runAnalysis(() => runTwoGroup(data.session_id, g, v), "two-group")}
          onBack={handleBackToSuggestions} />

      case "One-Way ANOVA":
        return <TwoGroupSelector columns={data.columns}
          onConfirm={(g, v) => runAnalysis(() => runAnova(data.session_id, g, v), "anova")}
          onBack={handleBackToSuggestions} />

      case "Correlation (Pearson / Spearman)":
        return <TwoNumericSelector columns={data.columns} labelA="First column" labelB="Second column"
          onConfirm={(a, b) => runAnalysis(() => runCorrelation(data.session_id, a, b), "correlation")}
          onBack={handleBackToSuggestions} />

      case "Simple Linear Regression":
        return <TwoNumericSelector columns={data.columns} labelA="Predictor column (X)" labelB="Outcome column (Y)"
          onConfirm={(a, b) => runAnalysis(() => runRegression(data.session_id, a, b), "regression")}
          onBack={handleBackToSuggestions} />

      case "Chi-Square / Fisher's Exact Test":
        return <ColumnSelector columns={data.columns} filterType="categorical"
          onConfirm={(cols) => runAnalysis(() => runChiSquare(data.session_id, cols[0], cols[1]), "chi-square")}
          onBack={handleBackToSuggestions} minSelect={2} maxSelect={2} />

      case "Dose-Response / IC50 Curve":
        return <TwoNumericSelector columns={data.columns} labelA="Concentration column" labelB="Response column"
          onConfirm={(a, b) => runAnalysis(() => runDoseResponse(data.session_id, a, b), "dose-response")}
          onBack={handleBackToSuggestions} />

      case "Kaplan-Meier Survival Analysis":
        return <KaplanMeierSelector columns={data.columns}
          onConfirm={(t, e, g) => runAnalysis(() => runKaplanMeier(data.session_id, t, e, g), "kaplan-meier")}
          onBack={handleBackToSuggestions} />

      default:
        return <SuggestionPanel data={data} onSelectTest={setSelectedTest} />
    }
  }

  const s: Record<string, React.CSSProperties> = {
    root: { minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" },
    nav: { position: "sticky", top: 0, zIndex: 50, background: "var(--nav-bg)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" },
    navInner: { maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 },
    logoBox: { width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" },
    logoText: { color: "var(--text)", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-sans)" },
    main: { maxWidth: 1100, margin: "0 auto", padding: "0 28px 80px" },
    footer: { borderTop: "1px solid var(--border)", marginTop: 80 },
    footerInner: { maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" },
  }

  return (
    <div style={s.root}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <button style={s.logo} onClick={handleReset}>
            <div style={s.logoBox}>
              <span style={{ color: isDark ? "#000" : "#fff", fontWeight: 800, fontSize: 12, fontFamily: "var(--font-mono)" }}>LR</span>
            </div>
            <span style={s.logoText}>LabRat</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {data && (
              <>
                <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  {data.filename} · {data.rows.toLocaleString()} {t("nav.rows")}
                </span>
                <button onClick={handleReset} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
                  {t("nav.newFile")}
                </button>
              </>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main style={s.main}>
        <AnimatePresence mode="wait">
          {!data ? (
            /* ── Landing page ── */
            <motion.div key="landing" variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.25 }}>

              {/* Centered hero */}
              <div style={{ textAlign: "center", paddingTop: 56, paddingBottom: 32 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: 20, padding: "4px 12px", marginBottom: 18, opacity: 0.9 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
                  <span style={{ color: "var(--accent-text)", fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {t("landing.badge")}
                  </span>
                </div>

                <h1 style={{ color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, margin: "0 0 14px", letterSpacing: "-0.02em" }}>
                  {t("landing.headline1")}<br />
                  <span style={{ color: "var(--accent-text)" }}>{t("landing.headline2")}</span>
                </h1>

                <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 28px" }}>
                  {t("landing.subtitle")}
                </p>

                {/* Feature pills */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 36 }}>
                  {(["descriptive", "ttest", "anova", "correlation", "regression", "chi", "dose", "km"] as const).map(k => (
                    <span key={k} style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "4px 11px", borderRadius: 20, fontFamily: "var(--font-mono)" }}>
                      {t(`landing.pills.${k}`)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div style={{ maxWidth: 600, margin: "0 auto 0" }}>
                <UploadZone onUpload={setData} />
              </div>

              {/* 3D plot */}
              <div style={{ marginTop: 48, border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--bg-alt)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: "var(--accent-dim)", color: "var(--accent-text)", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>
                      {t("landing.plotType")}
                    </span>
                    <span style={{ color: "var(--text)", fontSize: 12, fontWeight: 600 }}>
                      {t("landing.plotLabel")}
                    </span>
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-mono)" }}>
                    {t("landing.dragHint")}
                  </span>
                </div>
                <div style={{ height: 300 }}>
                  <Bivariateplot />
                </div>
              </div>

              {/* How it works */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 20 }}>
                {([
                  { step: "01", titleKey: "landing.steps.s1title", descKey: "landing.steps.s1desc" },
                  { step: "02", titleKey: "landing.steps.s2title", descKey: "landing.steps.s2desc" },
                  { step: "03", titleKey: "landing.steps.s3title", descKey: "landing.steps.s3desc" },
                ]).map(({ step, titleKey, descKey }) => (
                  <div key={step} style={{ padding: "18px 20px", border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)" }}>
                    <span style={{ color: "var(--accent-text)", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{step}</span>
                    <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: "6px 0 6px" }}>{t(titleKey)}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>{t(descKey)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Workspace ── */
            <motion.div key="workspace" variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              transition={{ duration: 0.25 }} style={{ paddingTop: 24 }}>

              <DataPreview data={data} onReset={handleReset} />

              {error && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid #7f1d1d", background: "#450a0a", color: "#fca5a5", fontSize: 13 }}>
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={results ? "results" : (selectedTest ?? "suggestions")}
                  variants={pageVariants} initial="initial" animate="animate" exit="exit"
                  transition={{ duration: 0.2 }}>
                  {results ? renderResults() : renderSelector()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {t("landing.footer")}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            FastAPI · React · Redis
          </span>
        </div>
      </footer>
    </div>
  )
}