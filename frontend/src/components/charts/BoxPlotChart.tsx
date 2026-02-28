/**
 * BoxPlotChart — Prism-style box plot with jittered individual data points.
 *
 * Per group renders:
 *   - Individual data points (jittered, semi-transparent)
 *   - Box from Q1 to Q3
 *   - Median line (solid)
 *   - Mean marker (hollow diamond)
 *   - Whiskers to 1.5×IQR (Tukey method), outliers as separate dots
 *
 * Built with pure SVG so it has no Recharts dependency and renders
 * correctly even when individual point data is present.
 */

interface GroupBoxData {
  name: string
  mean: number
  median: number
  std: number
  q1: number
  q3: number
  whisker_low: number
  whisker_high: number
  points: number[]
  n: number
}

interface Props {
  groups: GroupBoxData[]
  valueLabel: string
}

const COLOURS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

const M = { top: 28, right: 24, bottom: 52, left: 54 }
const VIEW_H = 280
const VIEW_W = 560
const PLOT_H = VIEW_H - M.top - M.bottom
const PLOT_W = VIEW_W - M.left - M.right

/** Deterministic pseudo-jitter — same seed always gives same layout */
function jitter(pointIdx: number, groupIdx: number, spread: number): number {
  const s = Math.sin(pointIdx * 9301 + groupIdx * 49297) * 233280
  return ((s - Math.floor(s)) - 0.5) * spread
}

export default function BoxPlotChart({ groups, valueLabel }: Props) {
  // ── Y scale ────────────────────────────────────────────────────
  const allVals = groups.flatMap(g => [
    ...(g.points ?? []),
    g.whisker_low, g.whisker_high, g.q1, g.q3, g.mean, g.median,
    ]).filter((v): v is number => v != null && isFinite(v))
    const rawMin = allVals.length ? Math.min(...allVals) : 0
    const rawMax = allVals.length ? Math.max(...allVals) : 1
  const pad = (rawMax - rawMin) * 0.12 || 1
  const yMin = rawMin - pad
  const yMax = rawMax + pad

  const ys = (v: number) =>
    M.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H

  // ── Y axis ticks ───────────────────────────────────────────────
  const nTicks = 5
  const ticks = Array.from({ length: nTicks + 1 }, (_, i) =>
    yMin + (i / nTicks) * (yMax - yMin)
  )

  // ── Column layout ──────────────────────────────────────────────
  const colW = PLOT_W / groups.length
  const boxW = Math.min(colW * 0.38, 42)
  const jitterSpread = boxW * 1.3

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8 }}>
        Distribution — {valueLabel}
      </p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        aria-label={`Box plot of ${valueLabel}`}
      >
        {/* ── Grid lines + Y axis labels ─────────────────────── */}
        {ticks.map((tick, i) => {
          const y = ys(tick)
          return (
            <g key={i}>
              <line
                x1={M.left} x2={M.left + PLOT_W}
                y1={y} y2={y}
                stroke="var(--border)" strokeWidth={1}
                strokeDasharray={i === 0 ? "none" : "3 3"}
              />
              <text
                x={M.left - 7} y={y + 3.5}
                textAnchor="end" fontSize={9}
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
              >
                {Math.abs(tick) >= 100
                  ? tick.toFixed(0)
                  : Math.abs(tick) >= 10
                    ? tick.toFixed(1)
                    : tick.toFixed(2)}
              </text>
            </g>
          )
        })}

        {/* ── Axes ──────────────────────────────────────────── */}
        <line
          x1={M.left} x2={M.left}
          y1={M.top} y2={M.top + PLOT_H}
          stroke="var(--border)" strokeWidth={1}
        />
        <line
          x1={M.left} x2={M.left + PLOT_W}
          y1={M.top + PLOT_H} y2={M.top + PLOT_H}
          stroke="var(--border)" strokeWidth={1}
        />

        {/* ── Per-group box plots ────────────────────────────── */}
        {groups.map((g, gi) => {
          const cx = M.left + colW * gi + colW / 2
          const col = COLOURS[gi % COLOURS.length]

          // Fall back to mean±std if box stats not yet available from backend
        const q1    = g.q1           ?? g.mean - g.std
        const q3    = g.q3           ?? g.mean + g.std
        const wl    = g.whisker_low  ?? q1
        const wh    = g.whisker_high ?? q3
        const yQ1   = ys(q1)
        const yQ3   = ys(q3)
        const yMed  = ys(g.median)
        const yMean = ys(g.mean)
        const yWL   = ys(wl)
        const yWH   = ys(wh)

          // Outliers = points outside whiskers
          const pts = g.points ?? []
          const inliers = pts.filter(p => p >= g.whisker_low && p <= g.whisker_high)
          const outliers = pts.filter(p => p < g.whisker_low || p > g.whisker_high)

          return (
            <g key={g.name}>
              {/* Jittered inlier points */}
              {inliers.map((pt, pi) => (
                <circle
                  key={pi}
                  cx={cx + jitter(pi, gi, jitterSpread)}
                  cy={ys(pt)}
                  r={2.2}
                  fill={col}
                  fillOpacity={0.22}
                  stroke={col}
                  strokeOpacity={0.35}
                  strokeWidth={0.5}
                />
              ))}

              {/* Outlier points (distinct style) */}
              {outliers.map((pt, pi) => (
                <circle
                  key={`out-${pi}`}
                  cx={cx + jitter(pi + 500, gi, jitterSpread * 0.6)}
                  cy={ys(pt)}
                  r={2.5}
                  fill="none"
                  stroke={col}
                  strokeOpacity={0.7}
                  strokeWidth={1.2}
                />
              ))}

              {/* Whisker low */}
              <line
                x1={cx} x2={cx} y1={yWL} y2={yQ1}
                stroke={col} strokeWidth={1.5}
              />
              <line
                x1={cx - boxW * 0.28} x2={cx + boxW * 0.28}
                y1={yWL} y2={yWL}
                stroke={col} strokeWidth={1.5}
              />

              {/* Whisker high */}
              <line
                x1={cx} x2={cx} y1={yQ3} y2={yWH}
                stroke={col} strokeWidth={1.5}
              />
              <line
                x1={cx - boxW * 0.28} x2={cx + boxW * 0.28}
                y1={yWH} y2={yWH}
                stroke={col} strokeWidth={1.5}
              />

              {/* Box Q1→Q3 */}
              <rect
                x={cx - boxW / 2}
                y={yQ3}
                width={boxW}
                height={Math.max(yQ1 - yQ3, 2)}
                fill={col}
                fillOpacity={0.15}
                stroke={col}
                strokeWidth={2}
                rx={3}
              />

              {/* Median line */}
              <line
                x1={cx - boxW / 2} x2={cx + boxW / 2}
                y1={yMed} y2={yMed}
                stroke={col} strokeWidth={2.5}
              />

              {/* Mean — hollow diamond */}
              <path
                d={`M ${cx} ${yMean - 4.5} L ${cx + 4.5} ${yMean} L ${cx} ${yMean + 4.5} L ${cx - 4.5} ${yMean} Z`}
                fill="var(--bg)"
                stroke={col}
                strokeWidth={1.5}
              />

              {/* X axis label */}
              <text
                x={cx} y={M.top + PLOT_H + 17}
                textAnchor="middle" fontSize={10.5}
                fill="var(--text)"
                fontFamily="var(--font-sans)"
                fontWeight={500}
              >
                {g.name}
              </text>

              {/* n= label */}
              <text
                x={cx} y={M.top + PLOT_H + 31}
                textAnchor="middle" fontSize={9}
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
              >
                n={g.n}
              </text>
            </g>
          )
        })}

        {/* ── Legend ────────────────────────────────────────── */}
        <g transform={`translate(${M.left + 4}, ${M.top - 18})`}>
          {/* Median */}
          <line x1={0} x2={12} y1={5} y2={5} stroke="var(--text-muted)" strokeWidth={2} />
          <text x={16} y={9} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-mono)">median</text>

          {/* Mean diamond */}
          <path d="M 72 1 L 76 5 L 72 9 L 68 5 Z"
            fill="var(--bg)" stroke="var(--text-muted)" strokeWidth={1.2}
          />
          <text x={80} y={9} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-mono)">mean</text>

          {/* Box */}
          <rect x={120} y={1} width={12} height={8} fill="var(--text-muted)" fillOpacity={0.15} stroke="var(--text-muted)" strokeWidth={1} rx={1} />
          <text x={136} y={9} fontSize={9} fill="var(--text-muted)" fontFamily="var(--font-mono)">IQR box</text>
        </g>
      </svg>
    </div>
  )
}