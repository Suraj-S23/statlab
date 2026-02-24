/**
 * Histogram — bar chart of binned frequency counts for a single numeric column.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
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

      <p style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 8 }}>
        {title}
      </p>

      <div className="histogram-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            // ⬇️ increased bottom margin to give rotated labels more room
            margin={{ top: 4, right: 24, left: 0, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

            <XAxis
              dataKey="bin_label"
              tick={{ fill: "var(--text-muted)", fontSize: 9 }}
              angle={-40}
              textAnchor="end"
              interval={interval}
              // ⬇️ slightly taller axis area for labels
              height={70}
              // ⬇️ more spacing between axis line and text
              tickMargin={8}
              // ⬇️ pushes labels downward (helps avoid overlap with axis line)
              dy={10}
              // ⬇️ optional: helps prevent ticks from getting too cramped
              minTickGap={10}
              // ⬇️ optional: cleaner look
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />

            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={28} />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
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