"""
Analysis router — receives a session ID and selected columns,
retrieves the dataset from Redis, runs the requested statistical
test, and returns results.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from utils.session import get_session
from services.analysis import (
    descriptive_statistics,
    two_group_comparison,
    one_way_anova,
)


router = APIRouter()


class AnalysisRequest(BaseModel):
    """Request body for all analysis endpoints."""

    session_id: str  # Redis session key from the upload response
    columns: List[str]  # Which columns to analyse


@router.post("/analysis/descriptive")
def run_descriptive(request: AnalysisRequest):
    """
    Retrieve dataset from Redis using session_id, then run
    descriptive statistics on the selected numeric columns.
    """
    data = get_session(request.session_id)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired. Please re-upload your file.",
        )

    try:
        results = descriptive_statistics(data, request.columns)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class TwoGroupRequest(BaseModel):
    """Request body for two-group comparison."""

    session_id: str
    group_col: str  # categorical column defining the two groups
    value_col: str  # numeric column to compare


@router.post("/analysis/two-group")
def run_two_group(request: TwoGroupRequest):
    """
    Retrieve dataset from Redis, then compare a numeric outcome
    between exactly two groups using t-test and Mann-Whitney U.
    """
    data = get_session(request.session_id)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired. Please re-upload your file.",
        )
    try:
        results = two_group_comparison(data, request.group_col, request.value_col)
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class AnovaRequest(BaseModel):
    """Request body for one-way ANOVA."""

    session_id: str
    group_col: str
    value_col: str


@router.post("/analysis/anova")
def run_anova(request: AnovaRequest):
    """
    Retrieve dataset from Redis, then compare a numeric outcome
    across 3+ groups using one-way ANOVA and Kruskal-Wallis.
    """
    data = get_session(request.session_id)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired. Please re-upload your file.",
        )
    try:
        results = one_way_anova(data, request.group_col, request.value_col)
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
