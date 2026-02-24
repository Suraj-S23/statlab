/**
 * DescriptiveResults — displays a summary statistics table
 * for each selected numeric column.
 */

import type { DescriptiveResults as Results } from "../types"

interface Props {
  results: Results
  onBack: () => void
}

/** Stat rows to display and their labels. */
const STATS = [
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

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Descriptive Statistics</h3>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-all"
        >
          ← Back to suggestions
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Statistic</th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium text-blue-400">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATS.map(({ key, label }) => (
              <tr key={key} className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-medium">{label}</td>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-gray-300">
                    {/* Highlight outlier count in yellow if non-zero */}
                    {key === "outliers" && results[col][key] > 0 ? (
                      <span className="text-yellow-400">{results[col][key as keyof typeof results[typeof col]]}</span>
                    ) : (
                      String(results[col][key as keyof typeof results[typeof col]])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}