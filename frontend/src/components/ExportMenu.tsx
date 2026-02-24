/**
 * ExportMenu — dropdown menu for exporting analysis results.
 * Supports PNG screenshot, PDF report, and CSV data download.
 */

import { useState, useRef, useEffect } from "react"
import { useExport } from "../hooks/useExport"

interface Props {
  /** ID of the DOM element to capture for PNG/PDF export */
  targetId: string
  /** Base filename (without extension) for all exports */
  filename: string
  /** Title shown in the PDF header */
  pdfTitle: string
  /** CSV data rows to export */
  csvData: Record<string, unknown>[] | Record<string, unknown>
}

export default function ExportMenu({ targetId, filename, pdfTitle, csvData }: Props) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { exportPNG, exportPDF, exportCSV } = useExport()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handle = async (type: "png" | "pdf" | "csv") => {
    setExporting(type)
    setOpen(false)
    try {
      if (type === "png") await exportPNG(targetId, filename)
      else if (type === "pdf") await exportPDF(targetId, filename, pdfTitle)
      else exportCSV(csvData, filename)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={!!exporting}
        className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
      >
        {exporting ? `Exporting ${exporting.toUpperCase()}...` : "↓ Export"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
          {[
            { type: "png" as const, label: "📷 PNG screenshot" },
            { type: "pdf" as const, label: "📄 PDF report" },
            { type: "csv" as const, label: "📊 CSV data" },
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => handle(type)}
              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}