import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Resolve all CSS variables to concrete values before html2canvas runs
function resolveCssVars(el: HTMLElement, dark: boolean) {
  const vars: Record<string, string> = {
    "--bg":           dark ? "#030712" : "#ffffff",
    "--bg-alt":       dark ? "#0f172a" : "#f8fafc",
    "--surface":      dark ? "#111827" : "#ffffff",
    "--border":       dark ? "#1f2937" : "#e5e7eb",
    "--text":         dark ? "#f9fafb" : "#111827",
    "--text-muted":   dark ? "#6b7280" : "#6b7280",
    "--accent":       "#3b82f6",
    "--accent-dim":   dark ? "#1e3a5f" : "#dbeafe",
    "--accent-text":  "#60a5fa",
    "--nav-bg":       dark ? "#030712cc" : "#ffffffcc",
  }

  const walk = (node: HTMLElement) => {
    const cs = getComputedStyle(node)
    const bg = cs.backgroundColor
    const fg = cs.color
    const bc = cs.borderColor

    // Replace oklch or var() references
    if (bg.startsWith("oklch") || bg.includes("var(")) {
      node.style.backgroundColor = dark ? "#111827" : "#ffffff"
    }
    if (fg.startsWith("oklch") || fg.includes("var(")) {
      node.style.color = dark ? "#d1d5db" : "#374151"
    }
    if (bc.startsWith("oklch") || bc.includes("var(")) {
      node.style.borderColor = dark ? "#374151" : "#e5e7eb"
    }

    // Resolve CSS variable values explicitly
    Object.entries(vars).forEach(([v, val]) => {
      if (node.style.cssText.includes(v)) {
        node.style.cssText = node.style.cssText.replace(new RegExp(`var\\(${v}\\)`, 'g'), val)
      }
    })

    Array.from(node.children).forEach(child => walk(child as HTMLElement))
  }
  walk(el)
}

async function captureZone(dark: boolean): Promise<string | null> {
  const zone = document.getElementById("chart-export-zone")
  if (!zone) return null

  // Force bg color on zone itself
  const origBg = zone.style.backgroundColor
  zone.style.backgroundColor = dark ? "#0f172a" : "#ffffff"

  try {
    const canvas = await html2canvas(zone, {
      backgroundColor: dark ? "#0f172a" : "#ffffff",
      scale: 3,
      useCORS: true,
      logging: false,
      onclone: (_doc, clonedEl) => {
        clonedEl.style.backgroundColor = dark ? "#0f172a" : "#ffffff"
        clonedEl.style.padding = "16px"
        resolveCssVars(clonedEl, dark)
      },
    })
    zone.style.backgroundColor = origBg
    return canvas.toDataURL("image/png")
  } catch (e) {
    zone.style.backgroundColor = origBg
    console.error("Capture error:", e)
    return null
  }
}

export function useExport() {
  const exportPNG = async (filename: string) => {
    const dataUrl = await captureZone(true)
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
  }

  const exportPublicationPDF = async (filename: string, title: string, subtitle: string) => {
    const dataUrl = await captureZone(false)
    if (!dataUrl) return

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