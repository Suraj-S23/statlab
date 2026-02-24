import jsPDF from "jspdf"

// Serialize the SVG inside chart-export-zone to a high-res PNG data URL
async function chartToPngDataUrl(bgColor: string, scale = 3): Promise<string | null> {
  const zone = document.getElementById("chart-export-zone")
  if (!zone) return null

  const svg = zone.querySelector("svg")
  if (!svg) return null

  const rect = zone.getBoundingClientRect()
  const w = rect.width || svg.clientWidth || 800
  const h = rect.height || svg.clientHeight || 400

  // Clone SVG and inline computed styles for text/axes
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute("width", String(w))
  clone.setAttribute("height", String(h))
  clone.style.background = bgColor

  // Inline font styles on all text nodes
  svg.querySelectorAll("text, tspan").forEach((orig, i) => {
    const cloned = clone.querySelectorAll("text, tspan")[i] as SVGElement
    if (!cloned) return
    const cs = window.getComputedStyle(orig)
    cloned.style.fontFamily = cs.fontFamily || "monospace"
    cloned.style.fontSize = cs.fontSize || "11px"
    cloned.style.fill = bgColor === "#ffffff" ? "#374151" : (cs.fill || "#9ca3af")
  })

  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(clone)
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext("2d")!
      ctx.scale(scale, scale)
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export function useExport() {
  const exportPNG = async (filename: string) => {
    const dataUrl = await chartToPngDataUrl("#0f172a", 3)
    if (!dataUrl) { console.error("chart-export-zone or SVG not found"); return }
    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
  }

  const exportPublicationPDF = async (filename: string, title: string, subtitle: string) => {
    const dataUrl = await chartToPngDataUrl("#ffffff", 3)
    if (!dataUrl) { console.error("chart-export-zone or SVG not found"); return }

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const margin = 16

    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageW, pageH, "F")

    pdf.setTextColor(17, 24, 39)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text(title, margin, margin + 6)

    pdf.setTextColor(107, 114, 128)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(subtitle, margin, margin + 12)

    pdf.setTextColor(156, 163, 175)
    pdf.setFontSize(8)
    pdf.text(
      `LabRat · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      pageW - margin, margin + 6, { align: "right" }
    )

    pdf.setDrawColor(229, 231, 235)
    pdf.line(margin, margin + 16, pageW - margin, margin + 16)

    // Measure image dimensions from the data URL
    const img = new Image()
    await new Promise<void>(res => { img.onload = () => res(); img.src = dataUrl })
    const imgW = pageW - margin * 2
    const imgH = Math.min((img.height / img.width) * imgW, pageH - margin * 2 - 24)
    pdf.addImage(dataUrl, "PNG", margin, margin + 20, imgW, imgH)
    pdf.save(`${filename}.pdf`)
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