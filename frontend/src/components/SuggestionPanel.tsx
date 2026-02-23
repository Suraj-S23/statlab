/**
 * SuggestionPanel — displays recommended statistical tests based on
 * the uploaded dataset's column structure. Users can select a test
 * to proceed with analysis.
 */

import { useEffect, useState } from "react"
import { getSuggestions } from "../services/api"
import type { UploadResponse, Suggestion } from "../types"

interface Props {
  data: UploadResponse
  onSelectTest: (test: string) => void
}

export default function SuggestionPanel({ data, onSelectTest }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /** Fetch suggestions from the backend whenever the dataset changes. */
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const results = await getSuggestions(data.columns)
        setSuggestions(results)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not load suggestions")
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [data.columns])

  // Separate tier 1 (core) and tier 2 (advanced) suggestions
  const core = suggestions.filter((s) => s.tier === 1)
  const advanced = suggestions.filter((s) => s.tier === 2)

  if (loading) return (
    <p className="text-blue-400 text-sm mt-6">Analysing your data structure...</p>
  )

  if (error) return (
    <p className="text-red-400 text-sm mt-6">{error}</p>
  )

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-white mb-1">Suggested Analyses</h3>
      <p className="text-gray-500 text-sm mb-6">
        Based on your data structure. Select a test to continue.
      </p>

      {/* Core tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {core.map((s) => (
          <SuggestionCard key={s.test} suggestion={s} onSelect={onSelectTest} />
        ))}
      </div>

      {/* Advanced tests — shown under a separate label */}
      {advanced.length > 0 && (
        <>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Advanced</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {advanced.map((s) => (
              <SuggestionCard key={s.test} suggestion={s} onSelect={onSelectTest} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Individual suggestion card — shows test name, reason, and required columns. */
function SuggestionCard({
  suggestion,
  onSelect,
}: {
  suggestion: Suggestion
  onSelect: (test: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(suggestion.test)}
      className="text-left p-4 rounded-xl border border-gray-800 bg-gray-900
        hover:border-blue-500 hover:bg-gray-800 transition-all group"
    >
      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
        {suggestion.test}
      </p>
      <p className="text-gray-400 text-sm mt-1">{suggestion.reason}</p>
      <p className="text-gray-600 text-xs mt-2">Needs: {suggestion.columns_needed}</p>
    </button>
  )
}