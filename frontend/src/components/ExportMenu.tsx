import { useState, useRef, useEffect } from "react"
import { useExport } from "../hooks/useExport"

interface Props {
  filename: string
  pdfTitle: string
  pdfSubtitle: string
  csvData: Record<string, unknown>[] | Record<string, unknown>
  hasChart: boolean
}

export default function ExportMenu({ filename, pdfTitle, pdfSubtitle, csvData, hasChart }: Props) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const { exportPNG, exportPublicationPDF, exportCSV } = useExport()

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
      if (type === "png") await exportPNG(filename)
      else if (type === "pdf") await exportPublicationPDF(filename, pdfTitle, pdfSubtitle)
      else exportCSV(csvData, filename)
    } finally {
      setExporting(null)
    }
  }

  const PngIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  const PdfIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  const CsvIcon = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>

  const options = [
    ...(hasChart ? [
      { type: "png" as const, icon: <PngIcon />, label: "Chart PNG" },
      { type: "pdf" as const, icon: <PdfIcon />, label: "Publication PDF" },
    ] : []),
    { type: "csv" as const, icon: <CsvIcon />, label: "CSV data" },
  ]
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
          width: 180, background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden",
        }}>
          {options.map(({ type, icon, label }, i) => (
            <button key={type} onClick={() => handle(type)} style={{
              width: "100%", textAlign: "left", padding: "10px 14px",
              fontSize: 12, color: "var(--text)", background: "none",
              border: "none", cursor: "pointer",
              borderBottom: i < options.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-alt)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {icon}
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}