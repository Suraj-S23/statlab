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
  return (
    <div className="mt-6">
      <p className="text-gray-400 text-xs mb-2">Group means — {valueLabel}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={groups} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#60a5fa" }}
            formatter={(value: number | undefined) => [value?.toFixed(4) ?? "—", "Mean"]}
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