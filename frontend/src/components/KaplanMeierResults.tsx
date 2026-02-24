/**
 * KaplanMeierResults — displays Kaplan-Meier survival analysis with step curve chart.
 */

import type { KaplanMeierResults as Results } from "../types"
import SurvivalCurve from "./charts/SurvivalCurve"

interface Props {
  results: Results
  onBack: () => void
}

export default function KaplanMeierResults({ results, onBack }: Props) {
  const hasGroups = results.groups !== undefined

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Kaplan-Meier Survival Analysis</h3>
          <p className="text-gray-400 text-sm mt-1">
            Time: {results.time_col} · Event: {results.event_col} · n = {results.n}
          </p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
          ← Back to suggestions
        </button>
      </div>

      <div className="p-4 rounded-xl border border-blue-800 bg-blue-950 mb-6">
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-6">
        <SurvivalCurve curve={results.curve} groups={results.groups} />
      </div>

      {!hasGroups && (
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900">
          <p className="text-gray-400 text-sm">Median survival time</p>
          <p className="text-white font-semibold text-lg mt-1">
            {results.median_survival ?? "Not reached"}
          </p>
        </div>
      )}

      {hasGroups && results.groups && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(results.groups).map(([group, data]) => (
            <div key={group} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
              <p className="text-blue-400 font-semibold mb-2">{group}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">n</span>
                  <span className="text-gray-300">{data.n}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Median survival</span>
                  <span className="text-gray-300">{data.median_survival ?? "Not reached"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}