/**
 * ContingencyChart — grouped bar chart of contingency table cell counts.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import type { ContingencyTable } from "../../types/index"

interface Props {
  table: ContingencyTable
  rowLabel: string
  colLabel: string
}

const COLOURS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

export default function ContingencyChart({ table, rowLabel, colLabel }: Props) {
  const data = table.row_labels.map((row: string, i: number) => {
    const entry: Record<string, string | number> = { name: row }
    table.col_labels.forEach((col: string, j: number) => {
      entry[col] = table.values[i][j]
    })
    return entry
  })

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 8px" }}>
        Cell counts — {rowLabel} × {colLabel}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          {table.col_labels.map((col: string, i: number) => (
            <Bar key={col} dataKey={col} fill={COLOURS[i % COLOURS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}