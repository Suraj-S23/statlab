/**
 * GroupBarChart — bar chart comparing mean values across groups,
 * used for two-group comparison and ANOVA results.
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"

interface GroupData {
  name: string
  mean: number
  std: number
  n: number
}

interface Props {
  groups: GroupData[]
  valueLabel: string
}

const COLOURS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function GroupBarChart({ groups, valueLabel }: Props) {
  const means = groups.map(g => g.mean)
  const minVal = Math.min(...means)
  const maxVal = Math.max(...means)
  const padding = (maxVal - minVal) * 0.3 || maxVal * 0.1
  const yMin = Math.max(0, Math.floor((minVal - padding) * 10) / 10)
  const yMax = Math.ceil((maxVal + padding) * 10) / 10

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8 }}>Group means — {valueLabel}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={groups} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} domain={[yMin, yMax]} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
            labelStyle={{ color: "var(--text-muted)" }}
            itemStyle={{ color: "var(--accent-text)" }}
            formatter={(value: number | undefined) => [value?.toFixed(2) ?? "N/A", "Mean"]}
          />
          <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
            {groups.map((_, i) => (
              <Cell key={i} fill={COLOURS[i % COLOURS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}