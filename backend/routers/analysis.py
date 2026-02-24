"""
Analysis router — receives a session ID and selected columns,
retrieves the dataset from Redis, runs the requested statistical
test, and returns results.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from utils.session import get_session
from services.analysis import descriptive_statistics

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
