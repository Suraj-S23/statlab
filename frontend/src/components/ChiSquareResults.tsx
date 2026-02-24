/**
 * ChiSquareResults — displays chi-square and Fisher's exact test results
 * for association between two categorical columns.
 */

import type { ChiSquareResults as Results } from "../types"
import ExportMenu from "./ExportMenu"

interface Props {
  results: Results
  onBack: () => void
}

export default function ChiSquareResults({ results, onBack }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Chi-Square / Fisher's Exact Test</h3>
          <p className="text-gray-400 text-sm mt-1">
            {results.col_a} vs {results.col_b} · n = {results.n}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            targetId="chi-square-results"
            filename={`chi_square_${results.col_a}_vs_${results.col_b}`}
            pdfTitle={`Chi-Square — ${results.col_a} vs ${results.col_b}`}
            csvData={[{
              col_a: results.col_a,
              col_b: results.col_b,
              n: results.n,
              chi2_statistic: results.chi_square.statistic,
              chi2_p_value: results.chi_square.p_value,
              dof: results.chi_square.dof,
              significant: results.chi_square.significant,
              fisher_odds_ratio: results.fisher?.odds_ratio ?? "N/A",
              fisher_p_value: results.fisher?.p_value ?? "N/A",
            }]}
          />
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-lg transition-all">
            ← Back to suggestions
          </button>
        </div>
      </div>

      <div id="chi-square-results">
      {/* Assumption warning */}
      {results.assumption_warning && (
        <div className="p-3 rounded-xl border border-yellow-800 bg-yellow-950 mb-4">
          <p className="text-yellow-400 text-sm">⚠ {results.assumption_warning}</p>
        </div>
      )}

      {/* Interpretation */}
      <div className={`p-4 rounded-xl border mb-6 ${
        results.chi_square.significant ? "border-green-700 bg-green-950" : "border-gray-700 bg-gray-900"
      }`}>
        <p className="text-sm font-medium text-white">{results.interpretation}</p>
      </div>

      {/* Results table */}
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
              <td className="px-4 py-3 text-gray-300">Chi-Square (df={results.chi_square.dof})</td>
              <td className="px-4 py-3 text-gray-300">χ² = {results.chi_square.statistic}</td>
              <td className="px-4 py-3 text-gray-300">{results.chi_square.p_value}</td>
              <td className="px-4 py-3">
                <Badge significant={results.chi_square.significant} />
              </td>
            </tr>
            {results.fisher && (
              <tr className="border-t border-gray-800 hover:bg-gray-900">
                <td className="px-4 py-3 text-gray-300">Fisher's Exact</td>
                <td className="px-4 py-3 text-gray-300">OR = {results.fisher.odds_ratio}</td>
                <td className="px-4 py-3 text-gray-300">{results.fisher.p_value}</td>
                <td className="px-4 py-3">
                  <Badge significant={results.fisher.significant} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}

function Badge({ significant }: { significant: boolean }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
      significant ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"
    }`}>
      {significant ? "Yes" : "No"}
    </span>
  )
}