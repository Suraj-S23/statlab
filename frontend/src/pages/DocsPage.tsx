/**
 * DocsPage — practical usage docs at "/docs".
 * Accordion sections covering CSV format, column types, missing values,
 * exports, session lifecycle, and troubleshooting.
 */
import { useState } from "react"
import { useTranslation } from "react-i18next"

const NAV_H = 52
const SECTION_IDS = ["csv", "types", "missing", "export", "session", "trouble"] as const
type SectionId = (typeof SECTION_IDS)[number]

export default function DocsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<SectionId | null>(null)

  return (
    <div style={{ paddingTop: NAV_H + 28, maxWidth: 980, margin: "0 auto" }}>
      {/* Header */}
      <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>{t("docs.kicker")}</p>
      <h1 style={{ margin: "0 0 10px 0" }}>{t("docs.title")}</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{t("docs.subtitle")}</p>

      {/* Accordion */}
      <div style={{ marginTop: 18, border: "1px solid var(--border)", borderRadius: 14 }}>
        {SECTION_IDS.map((id) => {
          const title = t(`docs.sections.${id}.title`)
          const desc = t(`docs.sections.${id}.desc`)
          const content = t(`docs.sections.${id}.content`, {
            returnObjects: true,
          }) as string[]

          const isOpen = open === id

          return (
            <div
              key={id}
              style={{
                borderTop: id === SECTION_IDS[0] ? "none" : "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => setOpen(isOpen ? null : id)}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 650 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {desc}
                  </div>
                </div>
                <div style={{ color: "var(--text-muted)" }}>▾</div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 18px 14px 18px" }}>
                  <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-muted)" }}>
                    {content.map((c) => (
                      <li key={c} style={{ margin: "8px 0" }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 26, color: "var(--text-muted)", fontSize: 12 }}>
        LabRat — statistical analysis for researchers FastAPI · React · Redis
      </div>
    </div>
  )
}