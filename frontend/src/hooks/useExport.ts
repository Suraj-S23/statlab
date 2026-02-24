/**
 * useExport — provides PNG and PDF export functionality for analysis results.
 * PNG captures the target element via html2canvas.
 * PDF embeds the PNG into a jsPDF document with a title and timestamp.
 */

import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function useExport() {
  /**
   * Capture a DOM element as a PNG and trigger a download.
   * @param elementId - the id of the element to capture
   * @param filename - download filename without extension
   */
  const exportPNG = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Export failed: element #${elementId} not found`)
      return
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#030712",
        scale: 2,
        useCORS: true,
        onclone: (_doc, el) => {
          // html2canvas does not support oklch — walk all elements and
          // replace any oklch color/background with safe hex fallbacks
          const all = el.querySelectorAll("*")
          const fallbacks: Record<string, string> = {
            // gray scale
            "background": "#030712",
            "color": "#d1d5db",
          }
          all.forEach((node) => {
            const el = node as HTMLElement
            const style = window.getComputedStyle(el)
            const bg = style.backgroundColor
            const fg = style.color
            const border = style.borderColor

            if (bg.includes("oklch")) el.style.backgroundColor = fallbacks["background"]
            if (fg.includes("oklch")) el.style.color = fallbacks["color"]
            if (border.includes("oklch")) el.style.borderColor = "#374151"
          })
        },
      })

      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = canvas.toDataURL("image/png")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error("PNG export error:", e)
    }
  }
  /**
   * Capture a DOM element and embed it in a PDF with a title header.
   * @param elementId - the id of the element to capture
   * @param filename - download filename without extension
   * @param title - heading shown at the top of the PDF
   */
  const exportPDF = async (elementId: string, filename: string, title: string) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const canvas = await html2canvas(element, {
        backgroundColor: "#030712",
        scale: 2,
        useCORS: true,
        onclone: (_doc, el) => {
          const all = el.querySelectorAll("*")
          all.forEach((node) => {
            const el = node as HTMLElement
            const style = window.getComputedStyle(el)
            if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "#030712"
            if (style.color.includes("oklch")) el.style.color = "#d1d5db"
            if (style.borderColor.includes("oklch")) el.style.borderColor = "#374151"
          })
        },
      })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 12

    // Header
    pdf.setFillColor(3, 7, 18) // gray-950
    pdf.rect(0, 0, pageWidth, pageHeight, "F")
    pdf.setTextColor(96, 165, 250) // blue-400
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("LabRat", margin, margin + 4)

    pdf.setTextColor(156, 163, 175) // gray-400
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text(title, margin, margin + 10)
    pdf.text(
      `Exported ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      pageWidth - margin,
      margin + 10,
      { align: "right" }
    )

    // Divider
    pdf.setDrawColor(55, 65, 81) // gray-700
    pdf.line(margin, margin + 14, pageWidth - margin, margin + 14)

    // Image — scale to fit page width with top margin
    const imgWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height / canvas.width) * imgWidth
    const maxImgHeight = pageHeight - margin * 2 - 20

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin + 18,
      imgWidth,
      Math.min(imgHeight, maxImgHeight)
    )

    pdf.save(`${filename}.pdf`)
  }

  /**
   * Convert a flat object or array of objects to CSV and trigger download.
   * @param data - array of row objects or a single flat object
   * @param filename - download filename without extension
   */
  const exportCSV = (data: Record<string, unknown>[] | Record<string, unknown>, filename: string) => {
    const rows = Array.isArray(data) ? data : [data]
    if (rows.length === 0) return

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => {
          const val = row[h]
          const str = val === null || val === undefined ? "" : String(val)
          // Wrap in quotes if contains comma, quote, or newline
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str
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

  return { exportPNG, exportPDF, exportCSV }
}