/**
 * SuggestionPanel — displays recommended statistical tests as clickable cards.
 */

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getSuggestions } from "../services/api"
import type { UploadResponse, Suggestion } from "../types"

interface Props {
  data: UploadResponse
  onSelectTest: (test: string) => void
}

const TEST_ICONS: Record<string, string> = {
  "Descriptive Statistics": "∑",
  "Independent t-test / Mann-Whitney U": "t",
  "One-Way ANOVA": "F",
  "Correlation (Pearson / Spearman)": "r",
  "Simple Linear Regression": "β",
  "Chi-Square / Fisher's Exact Test": "χ²",
  "Dose-Response / IC50 Curve": "IC",
  "Kaplan-Meier Survival Analysis": "S(t)",
}

export default function SuggestionPanel({ data, onSelectTest }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSuggestions(data.columns)
      .then(setSuggestions)
      .finally(() => setLoading(false))
  }, [data.columns])

  if (loading) return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse" />
      ))}
    </div>
  )

  const tier1 = suggestions.filter((s) => s.tier === 1)
  const tier2 = suggestions.filter((s) => s.tier === 2)

  return (
    <div className="mt-6">
      <div className="mb-5">
        <h2 className="text-white font-semibold text-base mb-1">Suggested analyses</h2>
        <p className="text-gray-500 text-sm">Based on your data's column types</p>
      </div>

      {/* Tier 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {tier1.map((s, i) => (
          <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} />
        ))}
      </div>

      {/* Tier 2 */}
      {tier2.length > 0 && (
        <>
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-3">Advanced</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tier2.map((s, i) => (
              <SuggestionCard key={s.test} suggestion={s} onClick={() => onSelectTest(s.test)} delay={i * 0.05} dim />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SuggestionCard({
  suggestion,
  onClick,
  delay,
  dim,
}: {
  suggestion: Suggestion
  onClick: () => void
  delay: number
  dim?: boolean
}) {
  const icon = TEST_ICONS[suggestion.test] ?? "→"

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-colors group w-full
        ${dim
          ? "border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800"
          : "border-gray-800 bg-gray-900 hover:border-blue-800 hover:bg-blue-950"
        }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
          ${dim
            ? "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300"
            : "bg-gray-800 text-blue-400 group-hover:bg-blue-900 group-hover:text-blue-300"
          }`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`font-semibold text-sm mb-0.5 transition-colors
            ${dim ? "text-gray-400 group-hover:text-gray-200" : "text-white"}`}>
            {suggestion.test}
          </p>
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{suggestion.reason}</p>
        </div>
      </div>
    </motion.button>
  )
}