"""
Analysis service — runs statistical computations on uploaded data.
Each function receives raw data and parameters, and returns
structured results ready for JSON serialisation.
"""

import pandas as pd
from scipy import stats
from typing import List


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
