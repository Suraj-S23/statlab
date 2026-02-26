/**
 * PrivacyPage — data handling transparency at "/privacy".
 */
import { useTranslation } from "react-i18next"

const NAV_H = 52
const ITEM_IDS = ["sent", "retention", "never", "browser", "third", "guidance"] as const

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div style={{ paddingTop: NAV_H + 28, maxWidth: 980, margin: "0 auto" }}>
      {/* Header */}
      <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>{t("privacy.kicker")}</p>
      <h1 style={{ margin: "0 0 10px 0" }}>{t("privacy.title")}</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{t("privacy.subtitle")}</p>

      {/* Content */}
      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {ITEM_IDS.map((id) => (
          <div
            key={id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "18px 18px",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0" }}>{t(`privacy.items.${id}.title`)}</h3>
            <p style={{ margin: 0, color: "var(--text-muted)", whiteSpace: "pre-line" }}>
              {t(`privacy.items.${id}.text`)}
            </p>
          </div>
        ))}
      </div>

      {/* Contact note */}
      <p style={{ marginTop: 18, color: "var(--text-muted)" }}>
        {t("privacy.contact")}{" "}
        <a
          href="https://github.com/Suraj-S23/LabRat"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent-text)" }}
        >
          GitHub
        </a>
        .
      </p>

      <div style={{ marginTop: 26, color: "var(--text-muted)", fontSize: 12 }}>
        LabRat — statistical analysis for researchers FastAPI · React · Redis
      </div>
    </div>
  )
}