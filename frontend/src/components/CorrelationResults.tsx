/**
 * CorrelationResults — displays Pearson and Spearman correlation with scatter plot.
 */

import type { CorrelationResults as Results } from "../types"
import ScatterPlot from "./charts/ScatterPlot"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

export default function CorrelationResults({ results, onBack }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Correlation Analysis</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.col_a} vs {results.col_b} · n = {results.n}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            targetId="correlation-results"
            filename={`correlation_${results.col_a}_vs_${results.col_b}`}
            pdfTitle={`Correlation — ${results.col_a} vs ${results.col_b}`}
            csvData={[
              { test: "Pearson r", coefficient: results.pearson.r, p_value: results.pearson.p_value, significant: results.pearson.significant },
              { test: "Spearman rho", coefficient: results.spearman.rho, p_value: results.spearman.p_value, significant: results.spearman.significant },
            ]}
          />
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
            ← Back to suggestions
          </button>
        </div>
      </div>

      <div id="correlation-results">
      <div className={`p-4 rounded-xl border mb-6 ${results.pearson.significant ? "border-green-700 bg-green-950" : "border-gray-700 bg-gray-900"}`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      <div className="p-4 rounded-xl border border-gray-800 bg-gray-900 mb-6">
        <ScatterPlot data={results.scatter} xLabel={results.col_a} yLabel={results.col_b} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Coefficient</th>
              <th className="px-4 py-3">p-value</th>
              <th className="px-4 py-3">Significant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-800 hover:bg-gray-900">
              <td className="px-4 py-3 text-gray-300">Pearson r</td>
              <td className="px-4 py-3 text-gray-300">{results.pearson.r}</td>
              <td className="px-4 py-3 text-gray-300">{results.pearson.p_value}</td>
              <td className="px-4 py-3"><Badge significant={results.pearson.significant} /></td>
            </tr>
            <tr className="border-t border-gray-800 hover:bg-gray-900">
              <td className="px-4 py-3 text-gray-300">Spearman ρ</td>
              <td className="px-4 py-3 text-gray-300">{results.spearman.rho}</td>
              <td className="px-4 py-3 text-gray-300">{results.spearman.p_value}</td>
              <td className="px-4 py-3"><Badge significant={results.spearman.significant} /></td>
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