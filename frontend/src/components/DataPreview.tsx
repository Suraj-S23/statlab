/**
 * DataPreview — displays a summary of the uploaded dataset.
 * Shows column type tags, missing value warnings, and a scrollable
 * preview of the first 5 rows.
 */

import type { UploadResponse } from "../types"

interface Props {
  data: UploadResponse
  onReset: () => void
}

export default function DataPreview({ data, onReset }: Props) {
  return (
    <div className="mt-8">

      {/* File summary header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{data.filename}</h2>
          <p className="text-gray-400 text-sm mt-1">{data.rows} rows · {data.columns.length} columns</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-all"
        >
          Upload new file
        </button>
      </div>

      {/* Column type tags — blue for numeric, purple for categorical */}
      <div className="flex gap-2 flex-wrap mb-6">
        {data.columns.map((col) => (
          <span
            key={col.name}
            className={`px-3 py-1 rounded-full text-xs font-medium
              ${col.type === "numeric"
                ? "bg-blue-900 text-blue-300"
                : col.type === "boolean"
                ? "bg-green-900 text-green-300"
                : "bg-purple-900 text-purple-300"}`}
          >
            {col.name} · {col.type}
            {/* Warn if column has missing values */}
            {col.missing > 0 && (
              <span className="ml-1 text-yellow-400">· {col.missing} missing</span>
            )}
          </span>
        ))}
      </div>

      {/* Scrollable data preview table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
            <tr>
              {data.columns.map((col) => (
                <th key={col.name} className="px-4 py-3 font-medium">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.preview.map((row, i) => (
              <tr key={i} className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
                {data.columns.map((col) => (
                  <td key={col.name} className="px-4 py-3 text-gray-300">
                    {row[col.name] !== undefined ? String(row[col.name]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 text-gray-500 text-xs">
          Showing first 5 rows of {data.rows}
        </div>
      </div>
    </div>
  )
}