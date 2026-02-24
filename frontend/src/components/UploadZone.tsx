import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { uploadCSV } from "../services/api"
import type { UploadResponse } from "../types"

interface Props { onUpload: (data: UploadResponse) => void }

export default function UploadZone({ onUpload }: Props) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) { setError(t("upload.errorCsvOnly")); return }
    setLoading(true); setError("")
    try {
      const data = await uploadCSV(file)
      onUpload(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("upload.errorFailed"))
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <motion.div whileHover={{ scale: 1.003 }} whileTap={{ scale: 0.998 }}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)} onDrop={onDrop}
        style={{ borderRadius: 16, border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`, background: dragging ? "var(--accent-dim)" : "var(--surface)", cursor: loading ? "default" : "pointer", transition: "all 0.2s" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
          {loading ? (
            <>
              <div style={{ width: 28, height: 28, marginBottom: 12, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>{t("upload.parsing")}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>{t("upload.parsingSubtitle")}</p>
            </>
          ) : (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 14, background: dragging ? "var(--accent)" : "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={dragging ? "var(--bg)" : "var(--text-muted)"} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 15, margin: "0 0 5px" }}>
                {dragging ? t("upload.drop") : t("upload.title")}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 8px" }}>
                {t("upload.dragOr")}{" "}
                <span style={{ color: "var(--accent-text)", textDecoration: "underline" }}>{t("upload.browse")}</span>
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-mono)", opacity: 0.6 }}>
                {t("upload.hint")}
              </p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: "#f87171", fontSize: 12, marginTop: 8, textAlign: "center" }}>
          {error}
        </motion.p>
      )}
    </div>
  )
}