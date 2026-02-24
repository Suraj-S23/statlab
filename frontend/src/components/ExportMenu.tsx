import { useState, useRef, useEffect } from "react"
import { useExport } from "../hooks/useExport"

interface Props {
  targetId: string
  filename: string
  pdfTitle: string
  csvData: Record<string, unknown>[] | Record<string, unknown>
}

export default function ExportMenu({ targetId, filename, pdfTitle, csvData }: Props) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { exportPNG, exportPDF, exportCSV } = useExport()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={!!exporting}
        style={{
          fontSize: 12, color: "var(--text-muted)", background: "none",
          border: "1px solid var(--border)", borderRadius: 8,
          padding: "5px 14px", cursor: "pointer", transition: "all 0.15s",
          opacity: exporting ? 0.5 : 1,
        }}
      >
        {exporting ? `Exporting ${exporting.toUpperCase()}...` : "↓ Export"}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          width: 172, background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden",
        }}>
          {[
            { type: "png" as const, label: "📷  PNG screenshot" },
            { type: "pdf" as const, label: "📄  PDF report" },
            { type: "csv" as const, label: "📊  CSV data" },
          ].map(({ type, label }) => (
            <button key={type} onClick={() => handle(type)} style={{
              width: "100%", textAlign: "left", padding: "10px 14px",
              fontSize: 12, color: "var(--text)", background: "none",
              border: "none", cursor: "pointer",
              borderBottom: type !== "csv" ? "1px solid var(--border)" : "none",
              transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-alt)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}