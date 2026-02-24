/**
 * AnovaResults — displays one-way ANOVA results with group bar chart.
 */

import type { AnovaResults as Results } from "../types"
import GroupBarChart from "./charts/GroupBarChart"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

export default function AnovaResults({ results, onBack }: Props) {
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
          <h3 className="text-lg font-semibold text-white">One-Way ANOVA</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.value_column} across {results.n_groups} groups of {results.group_column}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            targetId="anova-results"
            filename={`anova_${results.value_column}_by_${results.group_column}`}
            pdfTitle={`One-Way ANOVA — ${results.value_column} by ${results.group_column}`}
            csvData={Object.entries(results.groups).map(([group, g]) => ({
              group,
              n: g.n,
              mean: g.mean,
              median: g.median,
              std: g.std,
            }))}
          />
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
            ← Back to suggestions
          </button>
        </div>
      </div>

      <div id="anova-results">
      {/* Interpretation */}
      <div className={`p-4 rounded-xl border mb-4 ${results.anova.significant ? "border-green-700 bg-green-950" : "border-gray-700 bg-gray-900"}`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      {/* Skipped groups warning */}
      {results.skipped_groups.length > 0 && (
        <div className="p-3 rounded-xl border border-yellow-800 bg-yellow-950 mb-4">
          <p className="text-yellow-400 text-sm">
            ⚠ Excluded due to insufficient observations (&lt;3):{" "}
            <span className="font-medium">{results.skipped_groups.join(", ")}</span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-6">
        <GroupBarChart groups={chartData} valueLabel={results.value_column} />
      </div>

      {/* Per-group summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {groupNames.map((group) => {
          const g = results.groups[group]
          return (
            <div key={group} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
              <p className="text-blue-400 font-semibold mb-3 truncate">{group}</p>
              <div className="space-y-1 text-sm">
                {[["N", g.n], ["Mean", g.mean], ["Median", g.median], ["Std Dev", g.std]].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between">
                    <span className="text-gray-500">{l}</span>
                    <span className="text-gray-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Test table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Statistic</th>
              <th className="px-4 py-3">p-value</th>
              <th className="px-4 py-3">Significant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-800 hover:bg-gray-900">
              <td className="px-4 py-3 text-gray-300">One-Way ANOVA</td>
              <td className="px-4 py-3 text-gray-300">F = {results.anova.f_statistic}</td>
              <td className="px-4 py-3 text-gray-300">{results.anova.p_value}</td>
              <td className="px-4 py-3"><Badge significant={results.anova.significant} /></td>
            </tr>
            <tr className="border-t border-gray-800 hover:bg-gray-900">
              <td className="px-4 py-3 text-gray-300">Kruskal-Wallis</td>
              <td className="px-4 py-3 text-gray-300">H = {results.kruskal_wallis.h_statistic}</td>
              <td className="px-4 py-3 text-gray-300">{results.kruskal_wallis.p_value}</td>
              <td className="px-4 py-3"><Badge significant={results.kruskal_wallis.significant} /></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

function Badge({ significant }: { significant: boolean }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${significant ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
      {significant ? "Yes" : "No"}
    </span>
  )
}