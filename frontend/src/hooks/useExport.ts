import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Resolve CSS variables to safe hex values for html2canvas
function fixOklch(el: HTMLElement) {
  const all = el.querySelectorAll("*")
  all.forEach((node) => {
    const e = node as HTMLElement
    const s = window.getComputedStyle(e)
    if (s.backgroundColor.includes("oklch")) e.style.backgroundColor = "#030712"
    if (s.color.includes("oklch")) e.style.color = "#d1d5db"
    if (s.borderColor.includes("oklch")) e.style.borderColor = "#374151"
  })
}

export function useExport() {
  // Capture the chart zone only as PNG
  const exportPNG = async (filename: string) => {
    const element = document.getElementById("chart-export-zone")
    if (!element) { console.error("chart-export-zone not found"); return }
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#030712",
        scale: 3,
        useCORS: true,
        onclone: (_doc, el) => fixOklch(el),
      })
      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = canvas.toDataURL("image/png")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) { console.error("PNG export error:", e) }
  }

  // Publication-quality PDF: white background, chart + title, clean typography
  const exportPublicationPDF = async (filename: string, title: string, subtitle: string) => {
    const element = document.getElementById("chart-export-zone")
    if (!element) { console.error("chart-export-zone not found"); return }
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        onclone: (_doc, el) => {
          // Force white background and dark text for publication
          el.style.backgroundColor = "#ffffff"
          el.style.padding = "16px"
          const allEls = el.querySelectorAll("*")
          allEls.forEach((node) => {
            const e = node as HTMLElement
            const s = window.getComputedStyle(e)
            if (s.backgroundColor.includes("oklch") || s.backgroundColor.includes("rgb(3") || s.backgroundColor.includes("rgb(17"))
              e.style.backgroundColor = "#ffffff"
            if (s.color.includes("oklch")) e.style.color = "#111827"
            if (s.borderColor.includes("oklch")) e.style.borderColor = "#d1d5db"
            // Make chart lines/text dark
            if (e.tagName === "text") e.style.fill = "#374151"
          })
        },
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 16

      // White background
      pdf.setFillColor(255, 255, 255)
      pdf.rect(0, 0, pageW, pageH, "F")

      // Title
      pdf.setTextColor(17, 24, 39)
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(title, margin, margin + 6)

      // Subtitle
      pdf.setTextColor(107, 114, 128)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "normal")
      pdf.text(subtitle, margin, margin + 12)

      // Right: LabRat + date
      pdf.setTextColor(156, 163, 175)
      pdf.setFontSize(8)
      pdf.text(
        `LabRat · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
        pageW - margin, margin + 6, { align: "right" }
      )

      // Thin divider
      pdf.setDrawColor(229, 231, 235)
      pdf.line(margin, margin + 16, pageW - margin, margin + 16)

      // Chart image
      const imgW = pageW - margin * 2
      const imgH = Math.min((canvas.height / canvas.width) * imgW, pageH - margin * 2 - 22)
      pdf.addImage(imgData, "PNG", margin, margin + 20, imgW, imgH)

      pdf.save(`${filename}.pdf`)
    } catch (e) { console.error("PDF export error:", e) }
  }

  const exportCSV = (data: Record<string, unknown>[] | Record<string, unknown>, filename: string) => {
    const rows = Array.isArray(data) ? data : [data]
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(","),
      ...rows.map(row =>
        headers.map(h => {
          const val = row[h]
          const str = val === null || val === undefined ? "" : String(val)
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"` : str
        }).join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.download = `${filename}.csv`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return { exportPNG, exportPublicationPDF, exportCSV }
}