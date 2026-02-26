/**
 * MethodsPage — statistical reference for all 8 analyses, at "/methods".
 * Accordion layout: each card expands to show what / when / assumptions / outputs + citation.
 */

import { useState } from "react"

const NAV_H = 52

const METHODS = [
  {
    id: "desc",
    icon: "∑",
    name: "Descriptive Statistics",
    tagline: "Summarise the distribution of numeric data",
    what: "Computes central tendency (mean, median), spread (SD, IQR), shape (skewness, kurtosis), and detects outliers using the IQR rule. Includes a histogram for visual inspection.",
    when: [
      "Understand a variable's distribution before running inference",
      "Check normality and outlier assumptions for a subsequent test",
      "Report baseline characteristics of a study population",
    ],
    assumptions: [
      "Data must be numeric",
      "n ≥ 30 preferred for reliable moment estimates",
    ],
    outputs: [
      "Mean, Median, SD, IQR, Min, Max",
      "Skewness & Kurtosis",
      "Outlier count (IQR method)",
      "Histogram",
    ],
    ref: "Altman DG. Practical Statistics for Medical Research. Chapman & Hall, 1991.",
  },
  {
    id: "ttest",
    icon: "t",
    name: "t-test / Mann-Whitney U",
    tagline: "Compare a numeric outcome between two independent groups",
    what: "Runs Student's t-test and Mann-Whitney U simultaneously. The recommended test is selected automatically via Shapiro-Wilk normality testing within each group.",
    when: [
      "One numeric outcome measured in two separate, independent groups",
      "Example: drug vs placebo, treatment vs control",
    ],
    assumptions: [
      "Independent observations",
      "t-test: approximate normality or n ≥ 30 per group",
      "Mann-Whitney U: ordinal data and independence only",
    ],
    outputs: [
      "t-statistic and p-value",
      "Mann-Whitney U statistic and p-value",
      "Per-group: n, mean, median, SD",
      "Normality test result and recommended test",
    ],
    ref: "Mann HB, Whitney DR. Ann Math Stat. 1947;18(1):50–60.",
  },
  {
    id: "anova",
    icon: "F",
    name: "One-Way ANOVA / Kruskal-Wallis",
    tagline: "Compare a numeric outcome across three or more groups",
    what: "Runs one-way ANOVA and Kruskal-Wallis together. Groups with fewer than 3 observations are skipped automatically with a warning.",
    when: [
      "One numeric outcome across 3+ independent groups",
      "Example: four diet arms, multiple drug doses",
    ],
    assumptions: [
      "Independent observations",
      "ANOVA: approximate normality within groups, homogeneity of variance",
      "Kruskal-Wallis: ordinal data, similar spread across groups",
    ],
    outputs: [
      "F-statistic and p-value (ANOVA)",
      "H-statistic and p-value (Kruskal-Wallis)",
      "Per-group: n, mean, median, SD",
    ],
    ref: "Kruskal WH, Wallis WA. J Am Stat Assoc. 1952;47(260):583–621.",
  },
  {
    id: "corr",
    icon: "r",
    name: "Pearson / Spearman Correlation",
    tagline: "Measure association strength between two numeric variables",
    what: "Computes Pearson r (linear) and Spearman ρ (rank-based) together. Spearman is robust to outliers and non-linear monotonic relationships.",
    when: [
      "Quantify how two numeric variables co-vary",
      "Example: dose and response, age and biomarker level",
    ],
    assumptions: [
      "Pearson: bivariate normality, linear relationship, no extreme outliers",
      "Spearman: monotonic relationship (any shape)",
    ],
    outputs: [
      "Pearson r with p-value and significance",
      "Spearman ρ with p-value and significance",
      "Scatter plot",
    ],
    ref: "Spearman C. Am J Psychol. 1904;15(1):72–101.",
  },
  {
    id: "reg",
    icon: "β",
    name: "Simple Linear Regression",
    tagline: "Predict one numeric variable from another",
    what: "Fits Y = β₀ + β₁X by least squares. Reports slope, intercept, R², and significance of the relationship. The scatter plot includes the fitted line.",
    when: [
      "Predict or explain one variable from another",
      "Quantify how much Y changes per unit of X",
    ],
    assumptions: [
      "Linear relationship between X and Y",
      "Residuals approximately normally distributed",
      "Homoscedasticity (constant variance of residuals)",
      "Independent observations",
    ],
    outputs: [
      "Slope β₁ and intercept β₀",
      "R-squared and r-value",
      "p-value and standard error",
      "Scatter plot with fitted line",
    ],
    ref: "Draper NR, Smith H. Applied Regression Analysis. Wiley, 1998.",
  },
  {
    id: "chi",
    icon: "χ²",
    name: "Chi-Square / Fisher's Exact",
    tagline: "Test association between two categorical variables",
    what: "Builds a contingency table and tests independence. Switches to Fisher's exact test automatically when more than 20% of expected cell counts fall below 5.",
    when: [
      "Both variables are categorical or binary",
      "Example: treatment group vs response (Yes/No), gender vs disease status",
    ],
    assumptions: [
      "Chi-square: expected counts ≥ 5 in ≥ 80% of cells",
      "Fisher's exact: no minimum cell count requirement",
      "Independent observations",
    ],
    outputs: [
      "χ² statistic, degrees of freedom, p-value",
      "Fisher's odds ratio and p-value (when applicable)",
      "Warning when Fisher's is used instead of chi-square",
    ],
    ref: "Fisher RA. Statistical Methods for Research Workers. Oliver & Boyd, 1925.",
  },
  {
    id: "dose",
    icon: "IC",
    name: "Dose-Response / IC50",
    tagline: "Fit a sigmoidal curve to concentration-response data",
    what: "Fits a 4-parameter logistic (4PL) model: Y = Bottom + (Top−Bottom) / (1 + (IC50/X)^HillSlope). Estimates IC50, Hill slope, and curve bounds.",
    when: [
      "Compound concentration vs biological response data",
      "Example: drug inhibition of cell viability, enzyme kinetics",
    ],
    assumptions: [
      "Response follows a sigmoidal (S-shaped) curve",
      "Concentration column spans ≥ 2 orders of magnitude",
      "At least 8 data points recommended",
    ],
    outputs: [
      "IC50 with units",
      "Hill slope (steepness of the curve)",
      "Bottom and Top asymptotes",
      "R-squared goodness of fit",
      "Fitted curve overlaid on data",
    ],
    ref: "Sebaugh JL. Pharm Stat. 2011;10(2):128–134.",
  },
  {
    id: "km",
    icon: "S(t)",
    name: "Kaplan-Meier Survival Analysis",
    tagline: "Estimate survival probability over time with censored data",
    what: "Estimates S(t) — the probability of surviving past time t — using the product-limit estimator. Handles right-censored observations. With two groups, performs a log-rank test automatically.",
    when: [
      "Time-to-event data where some subjects are censored (lost to follow-up or study ended)",
      "Example: time until death, relapse, device failure",
    ],
    assumptions: [
      "Censoring is non-informative (independent of the event)",
      "Survival probabilities are stable across recruitment window",
    ],
    outputs: [
      "Kaplan-Meier survival curve",
      "Median survival time per group",
      "Log-rank test statistic and p-value (when groups are present)",
      "Per-group: n, events, median survival",
    ],
    ref: "Kaplan EL, Meier P. J Am Stat Assoc. 1958;53(282):457–481.",
  },
]

export default function MethodsPage() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: `${NAV_H + 48}px 32px 80px` }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            color: "var(--text-muted)", fontFamily: "var(--font-mono)",
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 10,
          }}>
            Statistical reference
          </p>
          <h1 style={{ color: "var(--text)", fontWeight: 700, fontSize: 28, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
            Methods
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            Each analysis LabRat runs is documented here — what it does, when to use it, its assumptions,
            and how to interpret the output.{" "}
            <span style={{ color: "var(--text)" }}>Useful before choosing a test, not just after.</span>
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {METHODS.map(m => (
            <div
              key={m.id}
              style={{
                background: "var(--surface)",
                border: `1px solid ${open === m.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 12, overflow: "hidden", transition: "border-color 0.15s",
              }}
            >
              {/* Trigger row */}
              <button
                onClick={() => setOpen(open === m.id ? null : m.id)}
                style={{
                  width: "100%", padding: "16px 20px", background: "none", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: open === m.id ? "var(--accent-dim)" : "rgba(45,212,191,0.04)",
                  border: `1px solid ${open === m.id ? "var(--accent)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                  color: open === m.id ? "var(--accent-text)" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: "0 0 2px" }}>{m.name}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, margin: 0 }}>{m.tagline}</p>
                </div>
                <span style={{
                  color: "var(--text-muted)", fontSize: 13,
                  display: "block", transform: open === m.id ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}>
                  ▾
                </span>
              </button>

              {/* Expanded content */}
              {open === m.id && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
                    {/* What it does */}
                    <div>
                      <p style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>What it does</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.65, margin: 0 }}>{m.what}</p>
                    </div>
                    {/* When to use */}
                    <div>
                      <p style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>When to use it</p>
                      <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                        {m.when.map(w => <li key={w} style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.65, marginBottom: 4 }}>{w}</li>)}
                      </ul>
                    </div>
                    {/* Assumptions */}
                    <div>
                      <p style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>Assumptions</p>
                      <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                        {m.assumptions.map(a => <li key={a} style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.65, marginBottom: 4 }}>{a}</li>)}
                      </ul>
                    </div>
                    {/* Outputs */}
                    <div>
                      <p style={{ color: "var(--accent-text)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>Outputs</p>
                      <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
                        {m.outputs.map(o => <li key={o} style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.65, marginBottom: 4 }}>{o}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Citation */}
                  <div style={{
                    marginTop: 16, padding: "10px 14px",
                    background: "rgba(45,212,191,0.04)", border: "1px solid rgba(45,212,191,0.1)",
                    borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                      Reference: {m.ref}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
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