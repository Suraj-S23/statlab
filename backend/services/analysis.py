"""
Analysis service — runs statistical computations on uploaded data.
Each function receives raw data and parameters, and returns
structured results ready for JSON serialisation.
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import List
from scipy.stats import ttest_ind, mannwhitneyu, shapiro
from scipy.stats import f_oneway, kruskal
from scipy.stats import pearsonr, spearmanr, chi2_contingency, fisher_exact
from scipy.optimize import curve_fit


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

    # Normalise string booleans so true/True/TRUE are treated as the same group
    if df[group_col].dtype == object:
        df[group_col] = df[group_col].str.strip().str.lower()

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


def one_way_anova(data: list[dict], group_col: str, value_col: str) -> dict:
    """
    Compare a numeric outcome across three or more groups using:
    - One-way ANOVA (parametric)
    - Kruskal-Wallis test (non-parametric alternative)

    Groups with fewer than 3 observations are skipped with a warning.
    Returns per-group descriptive statistics and a plain-English interpretation.
    """
    df = pd.DataFrame(data)

    if group_col not in df.columns or value_col not in df.columns:
        raise ValueError(f"Columns '{group_col}' or '{value_col}' not found in dataset")

    groups = df[group_col].dropna().unique()
    if len(groups) < 3:
        raise ValueError(
            f"Expected 3+ groups in '{group_col}', found {len(groups)}. "
            "Use t-test / Mann-Whitney for 2 groups."
        )

    # Normalise string booleans so true/True/TRUE are treated as the same group
    if df[group_col].dtype == object:
        df[group_col] = df[group_col].str.strip().str.lower()
    # Split into per-group series, drop missing values
    group_data = {
        str(g): pd.to_numeric(
            df[df[group_col] == g][value_col], errors="coerce"
        ).dropna()
        for g in groups
    }

    # Skip groups with fewer than 3 observations and warn
    skipped = []
    filtered = {}
    for name, series in group_data.items():
        if len(series) < 3:
            skipped.append(name)
        else:
            filtered[name] = series

    group_data = filtered

    if len(group_data) < 3:
        raise ValueError(
            f"After removing small groups, fewer than 3 valid groups remain. "
            f"Skipped groups: {', '.join(skipped)}"
        )

    # One-way ANOVA
    f_stat, f_p = f_oneway(*group_data.values())

    # Kruskal-Wallis (non-parametric alternative)
    k_stat, k_p = kruskal(*group_data.values())

    # Per-group summary statistics
    group_summaries = {}
    for name, series in group_data.items():
        group_summaries[name] = {
            "n": int(len(series)),
            "mean": round(float(series.mean()), 4),
            "median": round(float(series.median()), 4),
            "std": round(float(series.std()), 4),
        }

    # Plain-English interpretation
    alpha = 0.05
    f_significant = bool(f_p < alpha)
    k_significant = bool(k_p < alpha)

    if f_significant:
        interpretation = (
            f"One-way ANOVA found a statistically significant difference in "
            f"'{value_col}' across {len(group_data)} groups of '{group_col}' "
            f"(F = {round(float(f_stat), 4)}, p = {format_p(float(f_p))}). "
            f"Consider running post-hoc tests to identify which groups differ."
        )
    else:
        interpretation = (
            f"No statistically significant difference was found in '{value_col}' "
            f"across groups of '{group_col}' "
            f"(F = {round(float(f_stat), 4)}, p = {format_p(float(f_p))})."
        )

    return {
        "group_column": group_col,
        "value_column": value_col,
        "n_groups": int(len(group_data)),
        "skipped_groups": skipped,
        "groups": group_summaries,
        "anova": {
            "f_statistic": round(float(f_stat), 4),
            "p_value": format_p(float(f_p)),
            "significant": f_significant,
        },
        "kruskal_wallis": {
            "h_statistic": round(float(k_stat), 4),
            "p_value": format_p(float(k_p)),
            "significant": k_significant,
        },
        "interpretation": interpretation,
    }


def correlation(data: list[dict], col_a: str, col_b: str) -> dict:
    """
    Compute Pearson and Spearman correlation between two numeric columns.
    Returns correlation coefficients, p-values, and interpretation.
    """
    df = pd.DataFrame(data)

    if col_a not in df.columns or col_b not in df.columns:
        raise ValueError(f"Columns '{col_a}' or '{col_b}' not found in dataset")

    series_a = pd.to_numeric(df[col_a], errors="coerce")
    series_b = pd.to_numeric(df[col_b], errors="coerce")

    # Drop rows where either column is missing
    combined = pd.concat([series_a, series_b], axis=1).dropna()
    if len(combined) < 3:
        raise ValueError("Not enough valid observations to compute correlation.")

    a = combined.iloc[:, 0]
    b = combined.iloc[:, 1]

    pearson_r, pearson_p = pearsonr(a, b)
    spearman_r, spearman_p = spearmanr(a, b)

    # Interpret strength of correlation
    def strength(r):
        r = abs(r)
        if r >= 0.9:
            return "very strong"
        if r >= 0.7:
            return "strong"
        if r >= 0.5:
            return "moderate"
        if r >= 0.3:
            return "weak"
        return "negligible"

    direction = "positive" if pearson_r > 0 else "negative"
    interpretation = (
        f"There is a {strength(pearson_r)} {direction} correlation between "
        f"'{col_a}' and '{col_b}' "
        f"(Pearson r = {round(float(pearson_r), 4)}, p = {format_p(float(pearson_p))}). "
        f"Spearman rho = {round(float(spearman_r), 4)} (p = {format_p(float(spearman_p))})."
    )

    return {
        "col_a": col_a,
        "col_b": col_b,
        "n": int(len(combined)),
        "pearson": {
            "r": round(float(pearson_r), 4),
            "p_value": format_p(float(pearson_p)),
            "significant": bool(pearson_p < 0.05),
        },
        "spearman": {
            "rho": round(float(spearman_r), 4),
            "p_value": format_p(float(spearman_p)),
            "significant": bool(spearman_p < 0.05),
        },
        "interpretation": interpretation,
    }


def linear_regression(data: list[dict], predictor_col: str, outcome_col: str) -> dict:
    """
    Fit a simple linear regression model (outcome ~ predictor).
    Returns slope, intercept, R-squared, p-value, and interpretation.
    """
    from scipy.stats import linregress

    df = pd.DataFrame(data)

    if predictor_col not in df.columns or outcome_col not in df.columns:
        raise ValueError("Columns not found in dataset")

    x = pd.to_numeric(df[predictor_col], errors="coerce")
    y = pd.to_numeric(df[outcome_col], errors="coerce")

    combined = pd.concat([x, y], axis=1).dropna()
    if len(combined) < 3:
        raise ValueError("Not enough valid observations for regression.")

    x_clean = combined.iloc[:, 0]
    y_clean = combined.iloc[:, 1]

    slope, intercept, r_value, p_value, std_err = linregress(x_clean, y_clean)
    r_squared = r_value**2

    interpretation = (
        f"Linear regression of '{outcome_col}' on '{predictor_col}': "
        f"slope = {round(float(slope), 4)}, intercept = {round(float(intercept), 4)}, "
        f"R² = {round(float(r_squared), 4)}, p = {format_p(float(p_value))}. "
        f"{'The predictor is statistically significant.' if p_value < 0.05 else 'The predictor is not statistically significant.'} "
        f"R² = {round(float(r_squared), 4)} means {round(float(r_squared) * 100, 1)}% of variance in the outcome is explained by the predictor."
    )

    return {
        "predictor": predictor_col,
        "outcome": outcome_col,
        "n": int(len(combined)),
        "slope": round(float(slope), 4),
        "intercept": round(float(intercept), 4),
        "r_squared": round(float(r_squared), 4),
        "r_value": round(float(r_value), 4),
        "p_value": format_p(float(p_value)),
        "std_err": round(float(std_err), 4),
        "significant": bool(p_value < 0.05),
        "interpretation": interpretation,
    }


def chi_square(data: list[dict], col_a: str, col_b: str) -> dict:
    """
    Test association between two categorical columns using:
    - Chi-square test (for larger samples)
    - Fisher's exact test (for 2x2 contingency tables)

    Returns test statistics, p-values, and interpretation.
    """
    df = pd.DataFrame(data)

    if col_a not in df.columns or col_b not in df.columns:
        raise ValueError(f"Columns '{col_a}' or '{col_b}' not found in dataset")

    # Build contingency table
    contingency = pd.crosstab(df[col_a], df[col_b])

    if contingency.size == 0:
        raise ValueError("Could not build contingency table — check column values.")

    # Chi-square test
    chi2, chi_p, dof, expected = chi2_contingency(contingency)

    # Fisher's exact test only valid for 2x2 tables
    fisher_result = None
    if contingency.shape == (2, 2):
        odds_ratio, fisher_p = fisher_exact(contingency)
        fisher_result = {
            "odds_ratio": round(float(odds_ratio), 4),
            "p_value": format_p(float(fisher_p)),
            "significant": bool(fisher_p < 0.05),
        }

    # Check expected frequency assumption for chi-square validity
    low_expected = float((expected < 5).mean())
    assumption_warning = None
    if low_expected > 0.2:
        assumption_warning = (
            f"{round(low_expected * 100, 1)}% of expected cell counts are below 5 — "
            "chi-square results may not be reliable. Consider Fisher's exact test if available."
        )

    significant = bool(chi_p < 0.05)
    interpretation = (
        f"Chi-square test {'found' if significant else 'did not find'} a statistically significant "
        f"association between '{col_a}' and '{col_b}' "
        f"(χ² = {round(float(chi2), 4)}, df = {int(dof)}, p = {format_p(float(chi_p))})."
    )

    return {
        "col_a": col_a,
        "col_b": col_b,
        "n": int(df[[col_a, col_b]].dropna().shape[0]),
        "chi_square": {
            "statistic": round(float(chi2), 4),
            "p_value": format_p(float(chi_p)),
            "dof": int(dof),
            "significant": significant,
        },
        "fisher": fisher_result,
        "assumption_warning": assumption_warning,
        "interpretation": interpretation,
    }


def dose_response(data: list[dict], concentration_col: str, response_col: str) -> dict:
    """
    Fit a four-parameter logistic (4PL) sigmoidal curve to dose-response data.
    Commonly used in pharmacology to compute IC50/EC50 values.

    Model: y = bottom + (top - bottom) / (1 + (IC50/x)^hill_slope)
    """
    df = pd.DataFrame(data)

    if concentration_col not in df.columns or response_col not in df.columns:
        raise ValueError("Columns not found in dataset")

    x = pd.to_numeric(df[concentration_col], errors="coerce")
    y = pd.to_numeric(df[response_col], errors="coerce")

    combined = pd.concat([x, y], axis=1).dropna()
    if len(combined) < 4:
        raise ValueError("Need at least 4 data points for dose-response curve fitting.")

    x_clean = combined.iloc[:, 0].values
    y_clean = combined.iloc[:, 1].values

    # Remove zero or negative concentrations (log scale issues)
    mask = x_clean > 0
    x_clean = x_clean[mask]
    y_clean = y_clean[mask]

    if len(x_clean) < 4:
        raise ValueError(
            "Not enough positive concentration values for curve fitting. "
            "Ensure concentration column has positive non-zero values."
        )

    # Four-parameter logistic model
    def four_pl(x, bottom, top, ic50, hill):
        return bottom + (top - bottom) / (1 + (ic50 / x) ** hill)

    try:
        # Initial parameter guesses
        p0 = [min(y_clean), max(y_clean), np.median(x_clean), 1.0]
        popt, pcov = curve_fit(four_pl, x_clean, y_clean, p0=p0, maxfev=10000)
        bottom, top, ic50, hill = popt

        # Compute R-squared
        y_pred = four_pl(x_clean, *popt)
        ss_res = np.sum((y_clean - y_pred) ** 2)
        ss_tot = np.sum((y_clean - np.mean(y_clean)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        # Generate smooth curve points for frontend plotting
        x_curve = np.logspace(
            np.log10(max(x_clean.min(), 1e-10)), np.log10(x_clean.max()), 200
        )
        y_curve = four_pl(x_curve, *popt)

        return {
            "concentration_col": concentration_col,
            "response_col": response_col,
            "n": int(len(x_clean)),
            "ic50": round(float(ic50), 6),
            "hill_slope": round(float(hill), 4),
            "bottom": round(float(bottom), 4),
            "top": round(float(top), 4),
            "r_squared": round(float(r_squared), 4),
            "curve_x": [round(float(v), 6) for v in x_curve],
            "curve_y": [round(float(v), 4) for v in y_curve],
            "data_x": [round(float(v), 6) for v in x_clean],
            "data_y": [round(float(v), 4) for v in y_clean],
            "interpretation": (
                f"Dose-response curve fitted successfully. "
                f"IC50 = {round(float(ic50), 6)}, Hill slope = {round(float(hill), 4)}, "
                f"R² = {round(float(r_squared), 4)}. "
                f"{'Good fit (R² > 0.9).' if r_squared > 0.9 else 'Consider checking data quality (R² < 0.9).'}"
            ),
        }
    except RuntimeError:
        raise ValueError(
            "Curve fitting failed — the data may not follow a sigmoidal pattern. "
            "Check that concentration values span the response range."
        )


def kaplan_meier(
    data: list[dict], time_col: str, event_col: str, group_col: str = None
) -> dict:
    """
    Perform Kaplan-Meier survival analysis.

    Parameters:
    - time_col: time to event or censoring
    - event_col: 1 if event occurred, 0 if censored
    - group_col: optional grouping column for group comparison

    Returns survival curve data points and median survival times.
    """
    df = pd.DataFrame(data)

    for col in [time_col, event_col]:
        if col not in df.columns:
            raise ValueError(f"Column '{col}' not found in dataset")

    time = pd.to_numeric(df[time_col], errors="coerce")
    event = pd.to_numeric(df[event_col], errors="coerce")

    combined = pd.concat([time, event], axis=1).dropna()
    if len(combined) < 3:
        raise ValueError("Not enough valid observations for survival analysis.")

    def km_curve(times, events):
        """Compute Kaplan-Meier survival curve manually."""
        times = np.array(times)
        events = np.array(events)

        # Sort by time
        order = np.argsort(times)
        times = times[order]
        events = events[order]

        unique_times = np.unique(times[events == 1])
        survival = 1.0
        curve = [{"time": 0, "survival": 1.0}]

        for t in unique_times:
            at_risk = np.sum(times >= t)
            events_at_t = np.sum((times == t) & (events == 1))
            survival *= 1 - events_at_t / at_risk
            curve.append(
                {"time": round(float(t), 4), "survival": round(float(survival), 4)}
            )

        median_idx = next(
            (i for i, p in enumerate(curve) if p["survival"] <= 0.5), None
        )
        median_survival = curve[median_idx]["time"] if median_idx else None

        return curve, median_survival

    result = {
        "time_col": time_col,
        "event_col": event_col,
        "n": int(len(combined)),
    }

    if group_col and group_col in df.columns:
        groups = df[group_col].dropna().unique()
        group_curves = {}
        for g in groups:
            mask = df[group_col] == g
            t = pd.to_numeric(df.loc[mask, time_col], errors="coerce")
            e = pd.to_numeric(df.loc[mask, event_col], errors="coerce")
            valid = pd.concat([t, e], axis=1).dropna()
            if len(valid) < 3:
                continue
            curve, median = km_curve(valid.iloc[:, 0].values, valid.iloc[:, 1].values)
            group_curves[str(g)] = {
                "curve": curve,
                "median_survival": median,
                "n": int(len(valid)),
            }
        result["groups"] = group_curves
        result["interpretation"] = (
            f"Kaplan-Meier survival curves computed for {len(group_curves)} groups of '{group_col}'."
        )
    else:
        curve, median = km_curve(combined.iloc[:, 0].values, combined.iloc[:, 1].values)
        result["curve"] = curve
        result["median_survival"] = median
        result["interpretation"] = (
            f"Kaplan-Meier survival analysis completed. "
            f"Median survival time: {median if median else 'not reached'}."
        )

    return result
