/**
 * SurvivalCurve — step line chart for Kaplan-Meier survival curves.
 * Supports multiple groups rendered in different colours.
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { SurvivalPoint } from "../../types"

interface Props {
  /** Single curve (no groups) */
  curve?: SurvivalPoint[]
  /** Multiple group curves */
  groups?: Record<string, { curve: SurvivalPoint[] }>
}

const COLOURS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function SurvivalCurve({ curve, groups }: Props) {
  const tooltipStyle = {
    contentStyle: { backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 },
    itemStyle: { fontSize: 11 },
  }

  if (groups) {
    // Merge all group curves into a single dataset keyed by time
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
      <div className="mt-6">
        <p className="text-gray-400 text-xs mb-2">Survival probability over time</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={merged} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} label={{ value: "Time", position: "insideBottom", offset: -10, fill: "#6b7280" }} />
            <YAxis domain={[0, 1]} tick={{ fill: "#6b7280", fontSize: 10 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
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

  return (
    <div className="mt-6">
      <p className="text-gray-400 text-xs mb-2">Survival probability over time</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={curve} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10 }} />
          <YAxis domain={[0, 1]} tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} />
          <Line type="stepAfter" dataKey="survival" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}