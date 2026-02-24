"""
Analysis router — receives a session ID and selected columns,
retrieves the dataset from Redis, runs the requested statistical
test, and returns results.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from utils.session import get_session
from services.analysis import (
    descriptive_statistics,
    two_group_comparison,
    one_way_anova,
    correlation,
    linear_regression,
    chi_square,
    dose_response,
    kaplan_meier,
)

router = APIRouter()


class AnalysisRequest(BaseModel):
    """Request body for single-column analyses."""

    session_id: str
    columns: List[str]


class TwoGroupRequest(BaseModel):
    """Request body for two-group comparison."""

    session_id: str
    group_col: str
    value_col: str


class AnovaRequest(BaseModel):
    """Request body for one-way ANOVA."""

    session_id: str
    group_col: str
    value_col: str


class TwoColRequest(BaseModel):
    """Request body for analyses requiring exactly two columns."""

    session_id: str
    col_a: str
    col_b: str


class KaplanMeierRequest(BaseModel):
    """Request body for Kaplan-Meier survival analysis."""

    session_id: str
    time_col: str
    event_col: str
    group_col: Optional[str] = None


def get_data(session_id: str):
    """Helper to retrieve session data from Redis, raising 404 if expired."""
    data = get_session(session_id)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired. Please re-upload your file.",
        )
    return data


@router.post("/analysis/descriptive")
def run_descriptive(request: AnalysisRequest):
    """Run descriptive statistics on selected numeric columns."""
    data = get_data(request.session_id)
    try:
        return descriptive_statistics(data, request.columns)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/two-group")
def run_two_group(request: TwoGroupRequest):
    """Compare a numeric outcome between exactly two groups."""
    data = get_data(request.session_id)
    try:
        return two_group_comparison(data, request.group_col, request.value_col)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/anova")
def run_anova(request: AnovaRequest):
    """Compare a numeric outcome across 3+ groups using ANOVA and Kruskal-Wallis."""
    data = get_data(request.session_id)
    try:
        return one_way_anova(data, request.group_col, request.value_col)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/correlation")
def run_correlation(request: TwoColRequest):
    """Compute Pearson and Spearman correlation between two numeric columns."""
    data = get_data(request.session_id)
    try:
        return correlation(data, request.col_a, request.col_b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/regression")
def run_regression(request: TwoColRequest):
    """Fit a simple linear regression model."""
    data = get_data(request.session_id)
    try:
        return linear_regression(data, request.col_a, request.col_b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/chi-square")
def run_chi_square(request: TwoColRequest):
    """Test association between two categorical columns."""
    data = get_data(request.session_id)
    try:
        return chi_square(data, request.col_a, request.col_b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/dose-response")
def run_dose_response(request: TwoColRequest):
    """Fit a four-parameter logistic dose-response curve."""
    data = get_data(request.session_id)
    try:
        return dose_response(data, request.col_a, request.col_b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analysis/kaplan-meier")
def run_kaplan_meier(request: KaplanMeierRequest):
    """Perform Kaplan-Meier survival analysis."""
    data = get_data(request.session_id)
    try:
        return kaplan_meier(
            data, request.time_col, request.event_col, request.group_col
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
