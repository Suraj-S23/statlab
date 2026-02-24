/**
 * RegressionResults — displays linear regression results with scatter + line chart.
 */

import type { RegressionResults as Results } from "../types"
import ScatterPlot from "./charts/ScatterPlot"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

export default function RegressionResults({ results, onBack }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Linear Regression</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.outcome} ~ {results.predictor} · n = {results.n}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            targetId="regression-results"
            filename={`regression_${results.outcome}_on_${results.predictor}`}
            pdfTitle={`Linear Regression — ${results.outcome} ~ ${results.predictor}`}
            csvData={[{
              predictor: results.predictor,
              outcome: results.outcome,
              n: results.n,
              slope: results.slope,
              intercept: results.intercept,
              r_squared: results.r_squared,
              p_value: results.p_value,
              std_err: results.std_err,
              significant: results.significant,
            }]}
          />
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
            ← Back to suggestions
          </button>
        </div>
      </div>

      <div id="regression-results">
      <div className={`p-4 rounded-xl border mb-6 ${results.significant ? "border-green-700 bg-green-950" : "border-gray-700 bg-gray-900"}`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-6">
        <ScatterPlot
          data={results.scatter}
          xLabel={results.predictor}
          yLabel={results.outcome}
          line={results.line}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Slope", value: results.slope },
          { label: "Intercept", value: results.intercept },
          { label: "R²", value: results.r_squared },
          { label: "p-value", value: results.p_value },
          { label: "R", value: results.r_value },
          { label: "Std Error", value: results.std_err },
          { label: "n", value: results.n },
          { label: "Significant", value: results.significant ? "Yes" : "No" },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 rounded-xl border border-gray-800 bg-gray-900">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="text-white font-semibold">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}