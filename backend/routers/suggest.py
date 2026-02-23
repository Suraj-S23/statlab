"""
Suggest router — receives column metadata and returns recommended statistical tests.
"""

from fastapi import APIRouter
from typing import List
from services.suggest import ColumnInfo, Suggestion, suggest_tests

router = APIRouter()


@router.post("/suggest", response_model=List[Suggestion])
def get_suggestions(columns: List[ColumnInfo]):
    """
    Given a list of columns (name, type, missing), return a ranked list
    of suggested statistical tests appropriate for the data structure.
    """
    return suggest_tests(columns)
