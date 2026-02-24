/**
 * DoseResponseChart — sigmoidal curve with raw data point overlay.
 * Uses a ComposedChart with a smooth line (fitted curve) and scatter (raw data).
 */

import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Props {
  curveX: number[]
  curveY: number[]
  dataX: number[]
  dataY: number[]
  xLabel: string
  yLabel: string
}

export default function DoseResponseChart({ curveX, curveY, dataX, dataY, xLabel, yLabel }: Props) {
  const curveData = curveX.map((x, i) => ({ x, curve_y: curveY[i] }))
  const pointData = dataX.map((x, i) => ({ x, point_y: dataY[i] }))

  return (
    <div className="mt-6">
      <p className="text-gray-400 text-xs mb-2">{yLabel} ~ {xLabel} (4PL fit)</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="x"
            type="number"
            scale="log"
            domain={["auto", "auto"]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            label={{ value: xLabel, position: "insideBottom", offset: -10, fill: "#6b7280" }}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            itemStyle={{ fontSize: 11 }}
          />
          <Line
            data={curveData}
            type="monotone"
            dataKey="curve_y"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={2}
            name="Fitted curve"
          />
          <Scatter
            data={pointData}
            dataKey="point_y"
            fill="#3b82f6"
            r={4}
            name="Data points"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}