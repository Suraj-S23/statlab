/**
 * DoseResponseResults — displays dose-response curve fitting results
 * including IC50, Hill slope, and R².
 * Chart rendering will be added in the visualisation pass.
 */

import type { DoseResponseResults as Results } from "../types"

interface Props {
  results: Results
  onBack: () => void
}

export default function DoseResponseResults({ results, onBack }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Dose-Response / IC50</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.response_col} ~ {results.concentration_col} · n = {results.n}
          </p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
          ← Back to suggestions
        </button>
      </div>

      {/* Interpretation */}
      <div className={`p-4 rounded-xl border mb-6 ${
        results.r_squared > 0.9 ? "border-green-700 bg-green-950" : "border-yellow-700 bg-yellow-950"
      }`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      {/* Key parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "IC50", value: results.ic50 },
          { label: "Hill Slope", value: results.hill_slope },
          { label: "Bottom", value: results.bottom },
          { label: "Top", value: results.top },
          { label: "R²", value: results.r_squared },
          { label: "n", value: results.n },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="text-white font-semibold">{String(value)}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-6">
        Chart visualisation coming in the next update.
      </p>
    </div>
  )
}