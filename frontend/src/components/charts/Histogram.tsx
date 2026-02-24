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
  return (
    <div className="mt-4">
      <p className="text-gray-400 text-xs mb-2">{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="bin_label"
            tick={{ fill: "#6b7280", fontSize: 9 }}
            angle={-45}
            textAnchor="end"
            interval={Math.floor(data.length / 5)}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 11 }}
            itemStyle={{ color: "#60a5fa" }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
