/**
 * ScatterPlot — scatter chart for correlation and regression results.
 * Optionally renders a regression line overlay.
 */

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts"
import type { ScatterPoint } from "../../types"

interface Props {
  data: ScatterPoint[]
  xLabel: string
  yLabel: string
  line?: ScatterPoint[]
}

export default function ScatterPlot({ data, xLabel, yLabel, line }: Props) {
  const tooltipStyle = {
    contentStyle: { backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 },
    itemStyle: { color: "#60a5fa", fontSize: 11 },
  }

  if (line) {
    // Regression: scatter + line overlay via ComposedChart
    return (
      <div className="mt-6">
        <p className="text-gray-400 text-xs mb-2">{yLabel} ~ {xLabel}</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="x" type="number" name={xLabel} tick={{ fill: "#6b7280", fontSize: 10 }} domain={["auto", "auto"]} />
            <YAxis dataKey="y" type="number" name={yLabel} tick={{ fill: "#6b7280", fontSize: 10 }} />
            <Tooltip {...tooltipStyle} />
            <Scatter name="Data" data={data} fill="#3b82f6" opacity={0.5} r={2} />
            <Line
              data={line}
              type="linear"
              dataKey="y"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="Regression line"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <p className="text-gray-400 text-xs mb-2">{xLabel} vs {yLabel}</p>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="x" type="number" name={xLabel} tick={{ fill: "#6b7280", fontSize: 10 }} domain={["auto", "auto"]} />
          <YAxis dataKey="y" type="number" name={yLabel} tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Data" data={data} fill="#3b82f6" opacity={0.6} r={3} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}