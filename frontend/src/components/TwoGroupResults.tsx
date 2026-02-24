/**
 * TwoGroupResults — displays two-group comparison results with group bar chart.
 */

import type { TwoGroupResults as Results } from "../types"
import GroupBarChart from "./charts/GroupBarChart"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

export default function TwoGroupResults({ results, onBack }: Props) {
  const groupNames = Object.keys(results.groups)

  const chartData = groupNames.map((g) => ({
    name: g,
    mean: results.groups[g].mean,
    std: results.groups[g].std,
    n: results.groups[g].n,
  }))

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Two-Group Comparison</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.value_column} by {results.group_column}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            targetId="two-group-results"
            filename={`two_group_${results.value_column}_by_${results.group_column}`}
            pdfTitle={`Two-Group Comparison — ${results.value_column} by ${results.group_column}`}
            csvData={Object.entries(results.groups).map(([group, g]) => ({
              group,
              n: g.n,
              mean: g.mean,
              median: g.median,
              std: g.std,
              normality: g.normality,
            }))}
          />
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
            ← Back to suggestions
          </button>
        </div>
      </div>

      <div id="two-group-results">
      {/* Interpretation */}
      <div className={`p-4 rounded-xl border mb-6 ${
        results.t_test.significant || results.mann_whitney.significant
          ? "border-green-700 bg-green-950"
          : "border-gray-700 bg-gray-900"
      }`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-6">
        <GroupBarChart groups={chartData} valueLabel={results.value_column} />
      </div>

      {/* Group summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {groupNames.map((group) => {
          const g = results.groups[group]
          return (
            <div key={group} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
              <p className="text-blue-400 font-semibold mb-3">{group}</p>
              <div className="space-y-1 text-sm">
                <Row label="N" value={g.n} />
                <Row label="Mean" value={g.mean} />
                <Row label="Median" value={g.median} />
                <Row label="Std Dev" value={g.std} />
                <Row label="Normality" value={g.normality}
                  highlight={g.normality === "normal" ? "green" : "yellow"} />
                {g.normality_p !== null && <Row label="Shapiro-Wilk p" value={g.normality_p} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Test results */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Statistic</th>
              <th className="px-4 py-3">p-value</th>
              <th className="px-4 py-3">Significant</th>
              <th className="px-4 py-3">Recommended</th>
            </tr>
          </thead>
          <tbody>
            <TestRow name="Independent t-test" stat={results.t_test.statistic} p={results.t_test.p_value} significant={results.t_test.significant} recommended={results.recommended_test === "t-test"} />
            <TestRow name="Mann-Whitney U" stat={results.mann_whitney.statistic} p={results.mann_whitney.p_value} significant={results.mann_whitney.significant} recommended={results.recommended_test === "Mann-Whitney U"} />
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: "green" | "yellow" }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={highlight === "green" ? "text-green-400" : highlight === "yellow" ? "text-yellow-400" : "text-gray-300"}>
        {String(value)}
      </span>
    </div>
  )
}

function TestRow({ name, stat, p, significant, recommended }: { name: string; stat: number; p: string; significant: boolean; recommended: boolean }) {
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
      <td className="px-4 py-3 text-gray-300 flex items-center gap-2">
        {name}
        {recommended && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Recommended</span>}
      </td>
      <td className="px-4 py-3 text-gray-300">{stat}</td>
      <td className="px-4 py-3 text-gray-300">{p}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${significant ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
          {significant ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-4 py-3">{recommended && <span className="text-blue-400 text-xs">✓</span>}</td>
    </tr>
  )
}