/**
 * AnovaResults — displays results of a one-way ANOVA analysis.
 * Shows per-group summaries, F-statistic, Kruskal-Wallis H,
 * p-values, and a plain-English interpretation.
 */

import type { AnovaResults as Results } from "../types"

interface Props {
  results: Results
  onBack: () => void
}

export default function AnovaResults({ results, onBack }: Props) {
  const groupNames = Object.keys(results.groups)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">One-Way ANOVA</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.value_column} across {results.n_groups} groups of {results.group_column}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all"
        >
          ← Back to suggestions
        </button>
      </div>

      {/* Interpretation */}
      <div className={`p-4 rounded-xl border mb-6 ${
        results.anova.significant
          ? "border-green-700 bg-green-950"
          : "border-gray-700 bg-gray-900"
      }`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      {/* Warning for skipped groups */}
        {results.skipped_groups.length > 0 && (
        <div className="p-3 rounded-xl border border-yellow-800 bg-yellow-950 mb-6">
            <p className="text-yellow-400 text-sm">
            ⚠ The following groups were excluded due to insufficient observations (&lt;3):
            {" "}<span className="font-medium">{results.skipped_groups.join(", ")}</span>
            </p>
        </div>
        )}

      {/* Per-group summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {groupNames.map((group) => {
          const g = results.groups[group]
          return (
            <div key={group} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
              <p className="text-blue-400 font-semibold mb-3 truncate">{group}</p>
              <div className="space-y-1 text-sm">
                <Row label="N" value={g.n} />
                <Row label="Mean" value={g.mean} />
                <Row label="Median" value={g.median} />
                <Row label="Std Dev" value={g.std} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Test results table */}
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
            <tr className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
              <td className="px-4 py-3 text-gray-300">One-Way ANOVA</td>
              <td className="px-4 py-3 text-gray-300">F = {results.anova.f_statistic}</td>
              <td className="px-4 py-3 text-gray-300">{results.anova.p_value}</td>
              <td className="px-4 py-3">
                <SignificanceBadge significant={results.anova.significant} />
              </td>
            </tr>
            <tr className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
              <td className="px-4 py-3 text-gray-300">Kruskal-Wallis</td>
              <td className="px-4 py-3 text-gray-300">H = {results.kruskal_wallis.h_statistic}</td>
              <td className="px-4 py-3 text-gray-300">{results.kruskal_wallis.p_value}</td>
              <td className="px-4 py-3">
                <SignificanceBadge significant={results.kruskal_wallis.significant} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{String(value)}</span>
    </div>
  )
}

function SignificanceBadge({ significant }: { significant: boolean }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
      significant ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
    }`}>
      {significant ? "Yes" : "No"}
    </span>
  )
}