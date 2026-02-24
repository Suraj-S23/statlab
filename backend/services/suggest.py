"""
Suggestion engine — rule-based logic that recommends statistical tests
based on the types and number of columns in the uploaded dataset.

Rules are intentionally simple and transparent so researchers can understand
why a test is being suggested. The frontend allows users to override suggestions.
"""

from typing import List
from pydantic import BaseModel


class ColumnInfo(BaseModel):
    """Metadata for a single column, as parsed from the uploaded CSV."""

    name: str
    type: str  # "numeric" or "categorical"
    missing: int  # number of missing values in this column


class Suggestion(BaseModel):
    """A single recommended statistical test with context."""

    test: str  # Human-readable test name
    reason: str  # Why this test is being suggested
    columns_needed: str  # What column structure is required
    tier: int  # 1 = core test, 2 = advanced


def suggest_tests(columns: List[ColumnInfo]) -> List[Suggestion]:
    """
    Apply rule-based logic to recommend appropriate statistical tests.

    Rules (in priority order):
    - Numeric columns present → always suggest descriptive statistics
    - 2+ numeric columns → correlation and regression
    - 1 categorical + 1 numeric → t-test or ANOVA depending on group count
    - 2 categorical columns → chi-square / Fisher's exact
    - 2+ numeric columns → dose-response curve (relevant for biology)
    - Always suggest Kaplan-Meier as an option for survival data
    """
    numeric = [c for c in columns if c.type == "numeric"]
    categorical = [c for c in columns if c.type == "categorical"]

    suggestions = []

    # Descriptive stats — always relevant when numeric columns exist
    if numeric:
        suggestions.append(
            Suggestion(
                test="Descriptive Statistics",
                reason=f"Summarise the distribution of your {len(numeric)} numeric column(s)",
                columns_needed="Any numeric column",
                tier=1,
            )
        )

    # Two numeric columns → relationship analysis
    if len(numeric) >= 2:
        suggestions.append(
            Suggestion(
                test="Correlation (Pearson / Spearman)",
                reason="Measure the strength of relationship between two numeric variables",
                columns_needed="Two numeric columns",
                tier=1,
            )
        )
        suggestions.append(
            Suggestion(
                test="Simple Linear Regression",
                reason="Predict one numeric variable from another",
                columns_needed="One predictor, one outcome (both numeric)",
                tier=1,
            )
        )

    # Categorical + numeric → group comparison
    if len(categorical) >= 1 and len(numeric) >= 1:
        suggestions.append(
            Suggestion(
                test="Independent t-test / Mann-Whitney U",
                reason="Compare a numeric outcome between two groups",
                columns_needed="One categorical or boolean column with exactly 2 groups + one numeric column",
                tier=1,
            )
        )
        suggestions.append(
            Suggestion(
                test="One-Way ANOVA",
                reason="Compare a numeric outcome across three or more groups",
                columns_needed="One categorical column with 3+ groups (each with 3+ observations) + one numeric column",
                tier=1,
            )
        )

    # Two categorical columns → association test
    if len(categorical) >= 2:
        suggestions.append(
            Suggestion(
                test="Chi-Square / Fisher's Exact Test",
                reason="Test association between two categorical variables",
                columns_needed="Two categorical columns",
                tier=2,
            )
        )

    # Dose-response — common in biology/pharmacology
    if len(numeric) >= 2:
        suggestions.append(
            Suggestion(
                test="Dose-Response / IC50 Curve",
                reason="Fit a sigmoidal curve to concentration-response data",
                columns_needed="One concentration column + one response column (both numeric)",
                tier=1,
            )
        )

    # Survival analysis — always offered as an option
    suggestions.append(
        Suggestion(
            test="Kaplan-Meier Survival Analysis",
            reason="Analyse time-to-event data across groups",
            columns_needed="One time column + one event column (0/1) + optional group column",
            tier=2,
        )
    )

    return suggestions
