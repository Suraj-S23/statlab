"""
Analysis router — receives data and selected columns,
runs the requested statistical test, and returns results.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.analysis import descriptive_statistics

router = APIRouter()


class AnalysisRequest(BaseModel):
    """Request body for all analysis endpoints."""

    data: List[dict]  # The full dataset rows (from the upload preview... see note)
    columns: List[str]  # Which columns to analyse


@router.post("/analysis/descriptive")
def run_descriptive(request: AnalysisRequest):
    """
    Run descriptive statistics on the selected numeric columns.
    Returns per-column summary statistics.
    """
    try:
        results = descriptive_statistics(request.data, request.columns)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
