from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from services.suggest import ColumnInfo, Suggestion, suggest_tests
from utils.session import get_session

router = APIRouter()


class SuggestRequest(BaseModel):
    session_id: str
    columns: List[ColumnInfo]


@router.post("/suggest", response_model=List[Suggestion])
def get_suggestions(body: SuggestRequest):
    data = get_session(body.session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return suggest_tests(body.columns, data)
