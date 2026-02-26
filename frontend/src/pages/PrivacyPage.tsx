/**
 * PrivacyPage — data handling transparency at "/privacy".
 */

const NAV_H = 52

const ITEMS = [
  {
    title: "What is sent to the server",
    text: "When you upload a CSV, its contents are sent to the LabRat backend over HTTPS and stored temporarily in Redis. This is necessary to run statistical computations server-side using Python (SciPy, pandas). Nothing else is collected — no metadata beyond a session token, no IP logs beyond standard server logs.",
  },
  {
    title: "How long data is retained",
    text: "Your session and all uploaded data are automatically deleted after 2 hours. There is no persistent database. When the Redis TTL expires, the data is gone — no backup, no archive, no recovery. By design.",
  },
  {
    title: "What is never stored",
    text: "LabRat has no user accounts. No email addresses, passwords, or names. No cookies beyond a session token held in browser memory. No analytics on your uploaded data or its contents.",
  },
  {
    title: "What stays in the browser",
    text: "Theme preference and language selection are stored in localStorage — these never leave your device. The session token (a UUID) lives in browser memory only and is cleared when you close the tab.",
  },
  {
    title: "Third parties",
    text: "LabRat uses no third-party analytics (no Google Analytics, no Mixpanel). Google Fonts are loaded via CDN — a standard network request with no data from your session attached. The backend runs on Railway (railway.app), whose infrastructure privacy policy applies to server hosting.",
  },
  {
    title: "Research data guidance",
    text: "LabRat is suitable for de-identified or synthetic research data. If your institution's ethics policy restricts uploading patient data to third-party services, ensure your data is appropriately anonymised before use.",
  },
]

export default function PrivacyPage() {
  return (
    <>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: `${NAV_H + 48}px 32px 80px` }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            Trust & transparency
          </p>
          <h1 style={{ color: "var(--text)", fontWeight: 700, fontSize: 28, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
            Privacy
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, maxWidth: 440, margin: 0 }}>
            Exactly what happens to your data when you use LabRat.
          </p>
        </div>

        {/* Content */}
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            style={{
              marginBottom: 24, paddingBottom: 24,
              borderBottom: i < ITEMS.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <h3 style={{ color: "var(--text)", fontWeight: 600, fontSize: 13.5, margin: "0 0 8px" }}>
              {item.title}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.7, margin: 0 }}>
              {item.text}
            </p>
          </div>
        ))}

        {/* Contact note */}
        <div style={{
          padding: "14px 16px", background: "var(--accent-dim)",
          border: "1px solid rgba(45,212,191,0.15)", borderRadius: 10, marginTop: 8,
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: 11.5, lineHeight: 1.65, margin: 0 }}>
            Questions about data handling? Open an issue on{" "}
            <a
              href="https://github.com"
              style={{ color: "var(--accent-text)", textDecoration: "none" }}
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 32px", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>LabRat — statistical analysis for researchers</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>FastAPI · React · Redis</span>
        </div>
      </footer>
    </>
  )
}