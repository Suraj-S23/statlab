/**
 * Layout — shared shell for all pages.
 * Renders the fixed nav (logo, route links, theme toggle, lang switcher)
 * and the <Outlet /> for child routes.
 */

import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext.tsx"
import i18n from "../i18n/index"

const NAV_LINKS = [
  { label: "App",     path: "/app" },
  { label: "Samples", path: "/samples" },
  { label: "Methods", path: "/methods" },
  { label: "Docs",    path: "/docs" },
  { label: "Privacy", path: "/privacy" },
]

const LANGS = ["en", "de", "fr"] as const
type Lang = typeof LANGS[number]

function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Arctic Light" : "Switch to Obsidian"}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: "1px solid var(--border)", background: "var(--surface)",
        color: "var(--text-muted)", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontSize: 16,
      }}
    >
      {isDark ? "☀" : "◑"}
    </button>
  )
}

function LanguageSwitcher() {
  const { isDark } = useTheme()
  const [lang, setLang] = useState<Lang>(
    (localStorage.getItem("labrat-lang") as Lang) ?? "en"
  )
  const changeLang = (l: Lang) => {
    i18n.changeLanguage(l)
    localStorage.setItem("labrat-lang", l)
    setLang(l)
  }
  return (
    <div style={{
      display: "flex", gap: 2, background: "var(--surface)",
      borderRadius: 8, border: "1px solid var(--border)", padding: 2,
    }}>
      {LANGS.map(l => (
        <button key={l} onClick={() => changeLang(l)} style={{
          padding: "3px 9px", borderRadius: 6, border: "none", cursor: "pointer",
          fontSize: 11, fontWeight: 600, fontFamily: "var(--font-mono)",
          background: lang === l ? "var(--accent)" : "transparent",
          color: lang === l ? (isDark ? "#000" : "#fff") : "var(--text-muted)",
          transition: "all 0.15s",
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Fixed nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--nav-bg)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 32px",
          height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <img src="/labrat-logo-final.svg" alt="LabRat" style={{ height: 32, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text)", lineHeight: 1 }}>
              Lab<span style={{ color: "var(--accent-text)" }}>Rat</span>
            </span>
          </button>

          {/* Links + controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    background: "none", border: "none",
                    borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    cursor: "pointer", padding: "4px 10px",
                    fontSize: 12, fontFamily: "var(--font-sans)",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--accent-text)" : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {link.label}
                </button>
              )
            })}
            <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 6px" }} />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Page content */}
      <Outlet />
    </div>
  )
}