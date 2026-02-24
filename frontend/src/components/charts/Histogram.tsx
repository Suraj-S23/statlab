/**
 * Histogram — bar chart of binned frequency counts for a single numeric column.
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { HistogramBin } from "../../types"

interface Props {
  data: HistogramBin[]
  title: string
}

export default function Histogram({ data, title }: Props) {
  const interval = Math.max(0, Math.ceil(data.length / 6) - 1)

  return (
    <div style={{ marginTop: 4 }}>
      <style>{`.histogram-chart .recharts-wrapper svg { overflow: visible !important; }`}</style>
      <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8 }}>{title}</p>
      <div className="histogram-chart">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="bin_label"
              tick={{ fill: "var(--text-muted)", fontSize: 9 }}
              angle={-40}
              textAnchor="end"
              interval={interval}
              height={64}
              tickMargin={2}
            />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={28} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
              labelStyle={{ color: "var(--text-muted)", fontSize: 11 }}
              itemStyle={{ color: "var(--accent-text)" }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}