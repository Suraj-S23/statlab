"""
Analysis service — runs statistical computations on uploaded data.
Each function receives raw data and parameters, and returns
structured results ready for JSON serialisation.
"""

import pandas as pd
from scipy import stats
from typing import List
from scipy.stats import ttest_ind, mannwhitneyu, shapiro


def format_p(p: float) -> str:
    """Format p-value for display — show '<0.0001' for very small values."""
    if p < 0.0001:
        return "<0.0001"
    return str(round(p, 4))


def descriptive_statistics(data: List[dict], columns: List[str]) -> dict:
    """
    Compute descriptive statistics for the selected numeric columns.
    Skips boolean columns as they are not meaningful for continuous statistics.

    Returns per-column: mean, median, std, min, max, IQR,
    skewness, kurtosis, and outlier count (using 1.5x IQR rule).
    """
    df = pd.DataFrame(data)
    results = {}

    for col in columns:
        if col not in df.columns:
            continue

        series = pd.to_numeric(df[col], errors="coerce").dropna()

        # Skip boolean-like columns — not meaningful for continuous statistics
        if set(str(v).lower() for v in df[col].dropna().unique()).issubset(
            {"true", "false", "0", "1"}
        ):
            continue

        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1

        # Outliers defined as values beyond 1.5x IQR from Q1/Q3
        outliers = series[(series < (q1 - 1.5 * iqr)) | (series > (q3 + 1.5 * iqr))]

        results[col] = {
            "count": int(series.count()),
            "mean": round(float(series.mean()), 4),
            "median": round(float(series.median()), 4),
            "std": round(float(series.std()), 4),
            "min": round(float(series.min()), 4),
            "max": round(float(series.max()), 4),
            "q1": round(q1, 4),
            "q3": round(q3, 4),
            "iqr": round(iqr, 4),
            "skewness": round(float(stats.skew(series)), 4),
            "kurtosis": round(float(stats.kurtosis(series)), 4),
            "outliers": int(len(outliers)),
        }

    return results


def two_group_comparison(data: list[dict], group_col: str, value_col: str) -> dict:
    """
    Compare a numeric outcome between two groups using:
    - Independent t-test (parametric)
    - Mann-Whitney U test (non-parametric alternative)
    - Shapiro-Wilk normality test per group

    Returns test statistics, p-values, group summaries, and
    a plain-English interpretation of the results.
    """
    df = pd.DataFrame(data)

    # Validate columns exist
    if group_col not in df.columns or value_col not in df.columns:
        raise ValueError(f"Columns '{group_col}' or '{value_col}' not found in dataset")

    # Get unique groups
    groups = df[group_col].dropna().unique()
    if len(groups) != 2:
        raise ValueError(
            f"Expected exactly 2 groups in '{group_col}', found {len(groups)}. "
            "Use One-Way ANOVA for 3+ groups."
        )

    # Split into two groups and drop missing values
    group_a_label, group_b_label = str(groups[0]), str(groups[1])
    group_a = pd.to_numeric(
        df[df[group_col] == groups[0]][value_col], errors="coerce"
    ).dropna()
    group_b = pd.to_numeric(
        df[df[group_col] == groups[1]][value_col], errors="coerce"
    ).dropna()

    if len(group_a) < 3 or len(group_b) < 3:
        raise ValueError(
            "Each group must have at least 3 observations to run this test."
        )

    # Normality test (Shapiro-Wilk) — only reliable for n < 5000
    def normality(series):
        if len(series) > 5000:
            return None, "Sample too large for Shapiro-Wilk (n > 5000)"
        stat, p = shapiro(series)
        return round(float(p), 4), "normal" if p > 0.05 else "non-normal"

    norm_a_p, norm_a_result = normality(group_a)
    norm_b_p, norm_b_result = normality(group_b)

    # Independent t-test
    t_stat, t_p = ttest_ind(group_a, group_b)

    # Mann-Whitney U test
    u_stat, u_p = mannwhitneyu(group_a, group_b, alternative="two-sided")

    # Plain-English interpretation
    alpha = 0.05
    t_significant = t_p < alpha
    u_significant = u_p < alpha

    both_normal = norm_a_result == "normal" and norm_b_result == "normal"

    if both_normal:
        recommended = "t-test"
        significant = t_significant
        recommended_p = round(float(t_p), 4)
    else:
        recommended = "Mann-Whitney U"
        significant = u_significant
        recommended_p = round(float(u_p), 4)

    if significant:
        interpretation = (
            f"There is a statistically significant difference in '{value_col}' "
            f"between {group_a_label} and {group_b_label} "
            f"(p = {format_p(recommended_p)}, {recommended} test). "
            f"{'Both groups appear normally distributed, so the t-test is appropriate.' if both_normal else 'At least one group is non-normal, so Mann-Whitney U is recommended.'}"
        )
    else:
        interpretation = (
            f"No statistically significant difference was found in '{value_col}' "
            f"between {group_a_label} and {group_b_label} "
            f"(p = {format_p(recommended_p)}, {recommended} test)."
        )

    return {
        "group_column": group_col,
        "value_column": value_col,
        "groups": {
            group_a_label: {
                "n": int(len(group_a)),
                "mean": round(float(group_a.mean()), 4),
                "median": round(float(group_a.median()), 4),
                "std": round(float(group_a.std()), 4),
                "normality_p": norm_a_p,
                "normality": norm_a_result,
            },
            group_b_label: {
                "n": int(len(group_b)),
                "mean": round(float(group_b.mean()), 4),
                "median": round(float(group_b.median()), 4),
                "std": round(float(group_b.std()), 4),
                "normality_p": norm_b_p,
                "normality": norm_b_result,
            },
        },
        "t_test": {
            "statistic": round(float(t_stat), 4),
            "p_value": format_p(float(t_p)),
            "significant": bool(t_significant),
        },
        "mann_whitney": {
            "statistic": round(float(u_stat), 4),
            "p_value": round(float(u_p), 4),
            "significant": bool(u_significant),
        },
        "recommended_test": recommended,
        "interpretation": interpretation,
    }
