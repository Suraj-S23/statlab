"""
Suggestion engine — recommends statistical tests based on column types AND
actual data validation. Flags tests that are structurally possible but
would produce unreliable results (e.g. ANOVA groups with n < 3).
"""

from typing import List, Optional
from pydantic import BaseModel
import pandas as pd
import numpy as np


class ColumnInfo(BaseModel):
    name: str
    type: str  # "numeric", "categorical", "boolean"
    missing: int
    unique_count: int = 0


class Suggestion(BaseModel):
    test: str
    reason: str
    columns_needed: str
    tier: int
    warning: Optional[str] = None  # shown as amber text on card
    disabled: bool = False  # greyed out + unclickable if True


def suggest_tests(columns: List[ColumnInfo], data: list[dict]) -> List[Suggestion]:
    """
    Rule-based test recommendations with data-level validity checks.
    """
    df = pd.DataFrame(data) if data else pd.DataFrame()

    numeric = [c for c in columns if c.type == "numeric"]
    categorical = [c for c in columns if c.type in ("categorical", "boolean")]
    n_rows = len(df)

    suggestions: List[Suggestion] = []

    # ── Descriptive Statistics ─────────────────────────────────────────────────
    if numeric:
        suggestions.append(
            Suggestion(
                test="Descriptive Statistics",
                reason=f"Summarise the distribution of your {len(numeric)} numeric column(s)",
                columns_needed="Any numeric column",
                tier=1,
            )
        )

    # ── t-test / Mann-Whitney ──────────────────────────────────────────────────
    if categorical and numeric:
        two_group_col = None
        two_group_warning = None

        for cat in categorical:
            if cat.name not in df.columns:
                continue
            counts = df[cat.name].value_counts()
            n_groups = len(counts)
            if n_groups == 2:
                min_n = counts.min()
                if min_n < 5:
                    two_group_warning = (
                        f"'{cat.name}' has groups with only {min_n} observation(s). "
                        "At least 5 per group is recommended."
                    )
                two_group_col = cat
                break
            elif n_groups > 2:
                # Could still be used by picking 2 groups, but suggest ANOVA instead
                continue

        if two_group_col:
            suggestions.append(
                Suggestion(
                    test="Independent t-test / Mann-Whitney U",
                    reason=f"Compare '{numeric[0].name}' between the 2 groups in '{two_group_col.name}'",
                    columns_needed="One categorical column with exactly 2 groups + one numeric column",
                    tier=1,
                    warning=two_group_warning,
                )
            )
        else:
            # No 2-group column found — suggest but disable
            has_any_cat = any(c.name in df.columns for c in categorical)
            if has_any_cat:
                suggestions.append(
                    Suggestion(
                        test="Independent t-test / Mann-Whitney U",
                        reason="Compare a numeric outcome between two groups",
                        columns_needed="One categorical column with exactly 2 groups + one numeric column",
                        tier=1,
                        disabled=True,
                        warning="No column with exactly 2 groups found in this dataset.",
                    )
                )

    # ── One-Way ANOVA ──────────────────────────────────────────────────────────
    if categorical and numeric:
        anova_col = None
        anova_warning = None

        for cat in categorical:
            if cat.name not in df.columns:
                continue
            counts = df[cat.name].value_counts()
            n_groups = len(counts)
            if n_groups >= 3:
                min_n = counts.min()
                small_groups = counts[counts < 3].index.tolist()
                if small_groups:
                    anova_warning = (
                        f"Group(s) {small_groups} have fewer than 3 observations — "
                        "they will be skipped. Results may be unreliable."
                    )
                anova_col = cat
                break

        if anova_col:
            suggestions.append(
                Suggestion(
                    test="One-Way ANOVA",
                    reason=f"Compare '{numeric[0].name}' across {df[anova_col.name].nunique()} groups in '{anova_col.name}'",
                    columns_needed="One categorical column with 3+ groups + one numeric column",
                    tier=1,
                    warning=anova_warning,
                )
            )
        else:
            suggestions.append(
                Suggestion(
                    test="One-Way ANOVA",
                    reason="Compare a numeric outcome across three or more groups",
                    columns_needed="One categorical column with 3+ groups + one numeric column",
                    tier=1,
                    disabled=True,
                    warning="No column with 3 or more groups found in this dataset.",
                )
            )

    # ── Correlation ────────────────────────────────────────────────────────────
    if len(numeric) >= 2:
        corr_warning = None
        if n_rows < 10:
            corr_warning = (
                f"Only {n_rows} rows — correlation estimates will be imprecise."
            )

        # Check for near-constant columns
        for num in numeric[:4]:
            if num.name in df.columns:
                col_data = pd.to_numeric(df[num.name], errors="coerce").dropna()
                if col_data.std() < 1e-10:
                    corr_warning = (
                        f"'{num.name}' is constant — correlation is undefined."
                    )
                    break

        suggestions.append(
            Suggestion(
                test="Correlation (Pearson / Spearman)",
                reason="Measure the strength of relationship between two numeric variables",
                columns_needed="Two numeric columns",
                tier=1,
                warning=corr_warning,
            )
        )

    # ── Linear Regression ──────────────────────────────────────────────────────
    if len(numeric) >= 2:
        reg_warning = None
        if n_rows < 20:
            reg_warning = f"Only {n_rows} rows — regression estimates will have wide confidence intervals."

        suggestions.append(
            Suggestion(
                test="Simple Linear Regression",
                reason="Predict one numeric variable from another",
                columns_needed="One predictor, one outcome (both numeric)",
                tier=1,
                warning=reg_warning,
            )
        )

    # ── Chi-Square ─────────────────────────────────────────────────────────────
    if len(categorical) >= 2:
        chi_warning = None
        chi_disabled = False

        # Check expected cell counts using the first two suitable categoricals
        cat_cols = [c for c in categorical if c.name in df.columns]
        if len(cat_cols) >= 2:
            try:
                ct = pd.crosstab(df[cat_cols[0].name], df[cat_cols[1].name])
                expected = (
                    ct.sum(axis=1).values[:, None] * ct.sum(axis=0).values[None, :]
                ) / ct.values.sum()
                pct_low = (expected < 5).mean()
                if pct_low > 0.2:
                    chi_warning = (
                        f"{int(pct_low * 100)}% of expected cell counts are below 5. "
                        "Fisher's exact test will be used instead."
                    )
            except Exception:
                pass

            # Too many unique values → not meaningful
            for cat in cat_cols[:2]:
                if df[cat.name].nunique() > 15:
                    chi_warning = f"'{cat.name}' has {df[cat.name].nunique()} unique values — chi-square may not be meaningful."

        suggestions.append(
            Suggestion(
                test="Chi-Square / Fisher's Exact Test",
                reason="Test association between two categorical variables",
                columns_needed="Two categorical columns",
                tier=2,
                warning=chi_warning,
                disabled=chi_disabled,
            )
        )

    # ── Dose-Response / IC50 ───────────────────────────────────────────────────
    if len(numeric) >= 2:
        dose_warning = None
        dose_disabled = False

        # Look for a concentration-like column (spans multiple orders of magnitude)
        concentration_found = False
        for num in numeric:
            if num.name not in df.columns:
                continue
            col_data = pd.to_numeric(df[num.name], errors="coerce").dropna()
            col_data = col_data[col_data > 0]
            if len(col_data) > 0:
                log_range = np.log10(col_data.max()) - np.log10(col_data.min())
                if log_range >= 2:
                    concentration_found = True
                    break

        if not concentration_found:
            dose_warning = (
                "No column spanning ≥2 orders of magnitude found. "
                "Dose-response fitting requires wide concentration ranges."
            )
            dose_disabled = True

        if n_rows < 8:
            dose_warning = f"Only {n_rows} data points — 4-parameter curve fitting needs at least 8."
            dose_disabled = True

        suggestions.append(
            Suggestion(
                test="Dose-Response / IC50 Curve",
                reason="Fit a sigmoidal curve to concentration-response data",
                columns_needed="One concentration column + one response column (both numeric)",
                tier=1,
                warning=dose_warning,
                disabled=dose_disabled,
            )
        )

    # ── Kaplan-Meier ───────────────────────────────────────────────────────────
    km_warning = None
    km_disabled = False

    # Look for a 0/1 event column
    event_col_found = False
    time_col_found = False

    for col in columns:
        if col.name not in df.columns:
            continue
        col_data = pd.to_numeric(df[col.name], errors="coerce").dropna()
        unique_vals = set(col_data.unique())
        if unique_vals.issubset({0, 1, 0.0, 1.0}):
            n_events = int(col_data.sum())
            if n_events == 0:
                km_warning = f"'{col.name}' has no events (all zeros) — survival curve cannot be estimated."
                km_disabled = True
            event_col_found = True
        if (col_data >= 0).all() and col_data.max() > 1:
            time_col_found = True

    if not event_col_found:
        km_warning = "No binary event column (0/1) found in this dataset."
        km_disabled = True
    elif not time_col_found:
        km_warning = "No positive time column found in this dataset."
        km_disabled = True

    suggestions.append(
        Suggestion(
            test="Kaplan-Meier Survival Analysis",
            reason="Analyse time-to-event data, estimate survival probability over time",
            columns_needed="One time column + one event column (0/1) + optional group column",
            tier=2,
            warning=km_warning,
            disabled=km_disabled,
        )
    )

    return suggestions
