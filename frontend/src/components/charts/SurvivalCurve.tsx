/**
 * SurvivalCurve — step line chart for Kaplan-Meier survival curves.
 * Supports multiple groups rendered in different colours.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { SurvivalPoint } from "../../types"

interface Props {
  curve?: SurvivalPoint[]
  groups?: Record<string, { curve: SurvivalPoint[] }>
}

const COLOURS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

// Reduce number of X-axis ticks to avoid crowding
function getTickInterval(dataLength: number): number {
  if (dataLength <= 10) return 0
  if (dataLength <= 20) return 1
  if (dataLength <= 50) return Math.floor(dataLength / 10)
  return Math.floor(dataLength / 8)
}

const tickStyle = { fill: "#6b7280", fontSize: 10 }

const tooltipStyle = {
  contentStyle: { backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 },
  itemStyle: { fontSize: 11 },
}

export default function SurvivalCurve({ curve, groups }: Props) {
  if (groups) {
    const groupNames = Object.keys(groups)
    const timeSet = new Set<number>()
    groupNames.forEach((g) => groups[g].curve.forEach((p) => timeSet.add(p.time)))
    const times = Array.from(timeSet).sort((a, b) => a - b)

    const merged = times.map((t) => {
      const row: Record<string, number> = { time: t }
      groupNames.forEach((g) => {
        const match = [...groups[g].curve].reverse().find((p) => p.time <= t)
        row[g] = match ? match.survival : 1
      })
      return row
    })

    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8, fontFamily: "var(--font-mono)" }}>
          Survival probability over time
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={merged} margin={{ top: 8, right: 24, left: 0, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={tickStyle}
              interval={getTickInterval(times.length)}
              label={{ value: "Time (days)", position: "insideBottom", offset: -32, fill: "#6b7280", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 1]}
              tick={tickStyle}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              width={40}
              label={{ value: "Survival", angle: -90, position: "insideLeft", offset: 12, fill: "#6b7280", fontSize: 11 }}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: number | undefined) => v != null ? [`${(v * 100).toFixed(1)}%`] : [""]}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 16 }}
            />
            {groupNames.map((g, i) => (
              <Line
                key={g}
                type="stepAfter"
                dataKey={g}
                stroke={COLOURS[i % COLOURS.length]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (!curve) return null

  const interval = getTickInterval(curve.length)

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8, fontFamily: "var(--font-mono)" }}>
        Survival probability over time
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={curve} margin={{ top: 8, right: 24, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="time"
            tick={tickStyle}
            interval={interval}
            label={{ value: "Time (days)", position: "insideBottom", offset: -32, fill: "#6b7280", fontSize: 11 }}
          />
          <YAxis
            domain={[0, 1]}
            tick={tickStyle}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            width={40}
            label={{ value: "Survival", angle: -90, position: "insideLeft", offset: 12, fill: "#6b7280", fontSize: 11 }}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(v: number | undefined) => v != null ? [`${(v * 100).toFixed(1)}%`] : [""]}
          />
          <Line type="stepAfter" dataKey="survival" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}