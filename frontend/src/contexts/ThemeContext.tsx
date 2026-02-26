/**
 * ThemeContext — manages Obsidian (dark) / Arctic Light (light) toggle.
 * Applies data-theme attribute to the root element so CSS variables cascade.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ThemeId = "obsidian" | "arctic"

interface ThemeCtx {
  theme: ThemeId
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: "obsidian",
  isDark: true,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem("labrat-theme") as ThemeId) ?? "obsidian"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "arctic" ? "arctic" : "")
    localStorage.setItem("labrat-theme", theme)
  }, [theme])

  const toggle = () => setTheme(t => t === "obsidian" ? "arctic" : "obsidian")

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "obsidian", toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
