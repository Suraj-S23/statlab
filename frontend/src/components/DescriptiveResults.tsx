/**
 * DescriptiveResults — displays descriptive statistics with histogram per column.
 * Allows toggling between columns when multiple are selected.
 */

import { useState } from "react"
import type { DescriptiveResults as Results } from "../types"
import Histogram from "./charts/Histogram"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

const STATS_ROWS = [
  { key: "count", label: "Count" },
  { key: "mean", label: "Mean" },
  { key: "median", label: "Median" },
  { key: "std", label: "Std Dev" },
  { key: "min", label: "Min" },
  { key: "max", label: "Max" },
  { key: "q1", label: "Q1 (25%)" },
  { key: "q3", label: "Q3 (75%)" },
  { key: "iqr", label: "IQR" },
  { key: "skewness", label: "Skewness" },
  { key: "kurtosis", label: "Kurtosis" },
  { key: "outliers", label: "Outliers" },
]

export default function DescriptiveResults({ results, onBack }: Props) {
  const columns = Object.keys(results)
  const [activeCol, setActiveCol] = useState(columns[0])
  const stats = results[activeCol]

  // Flatten results to CSV rows — one row per column
  const csvData = columns.map((col) => ({
    column: col,
    ...Object.fromEntries(
      STATS_ROWS.map(({ key }) => [key, results[col][key as keyof typeof stats]])
    ),
  })) as Record<string, unknown>[]

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Descriptive Statistics</h3>
        <div className="flex gap-2">
          <ExportMenu
            targetId="descriptive-results"
            filename={`descriptive_${activeCol}`}
            pdfTitle={`Descriptive Statistics — ${activeCol}`}
            csvData={csvData}
          />
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all"
          >
            ← Back to suggestions
          </button>
        </div>
      </div>

      {/* Exportable content wrapper */}
      <div id="descriptive-results">
        {/* Column tabs */}
        {columns.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => setActiveCol(col)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                  ${activeCol === col
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"
                  }`}
              >
                {col}
              </button>
            ))}
          </div>
        )}

        {/* Histogram */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-4">
          <Histogram data={stats.histogram} title={`Distribution of ${activeCol}`} />
        </div>

        {/* Stats table */}
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Statistic</th>
                <th className="px-4 py-3">{activeCol}</th>
              </tr>
            </thead>
            <tbody>
              {STATS_ROWS.map(({ key, label }) => (
                <tr
                  key={key}
                  className={`border-t border-gray-800 hover:bg-gray-900 transition-colors
                    ${key === "outliers" && (stats[key as keyof typeof stats] as number) > 0
                      ? "text-yellow-400"
                      : "text-gray-300"
                    }`}
                >
                  <td className="px-4 py-2.5 text-gray-500">{label}</td>
                  <td className="px-4 py-2.5">
                    {String(stats[key as keyof typeof stats])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}