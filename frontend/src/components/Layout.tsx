/**
 * Layout — shared shell for all pages.
 * Renders the fixed nav (logo, route links, theme toggle, lang switcher)
 * and the Outlet for child routes.
 */
import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useTheme } from "../contexts/ThemeContext.tsx"
import i18n from "../i18n/index"

const NAV_LINKS = [
  { key: "app", path: "/app" },
  { key: "samples", path: "/samples" },
  { key: "methods", path: "/methods" },
  { key: "docs", path: "/docs" },
  { key: "privacy", path: "/privacy" },
] as const

const LANGS = ["en", "de", "fr"] as const
type Lang = (typeof LANGS)[number]

function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return <button onClick={toggle}>{isDark ? "☀" : "◑"}</button>
}

function LanguageSwitcher() {
  const { isDark } = useTheme()
  const [lang, setLang] = useState(
    (localStorage.getItem("labrat-lang") as Lang) ?? "en"
  )

  const changeLang = (l: Lang) => {
    i18n.changeLanguage(l)
    localStorage.setItem("labrat-lang", l)
    setLang(l)
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => changeLang(l)}
          style={{
            padding: "3px 9px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "var(--font-mono)",
            background: lang === l ? "var(--accent)" : "transparent",
            color: lang === l ? (isDark ? "#000" : "#fff") : "var(--text-muted)",
            transition: "all 0.15s",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div>
      {/* Fixed nav */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 18px",
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <img
            src="/labrat.svg"
            alt="LabRat"
            width={22}
            height={22}
            style={{ display: "block" }}
          />
          <span style={{ fontWeight: 700 }}>{t("layout.brand")}</span>
        </button>

        {/* Links + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: isActive
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  padding: "4px 10px",
                  fontSize: 12,
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {t(`layout.nav.${link.key}`)}
              </button>
            )
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: 52 }}>
        <Outlet />
      </div>
    </div>
  )
}