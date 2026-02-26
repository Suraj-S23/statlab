from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.session import get_session

# placeholder: implement properly in services/export.py
from services.export import export_csv, export_json

router = APIRouter()


class ExportRequest(BaseModel):
    session_id: str
    analysis_type: str
    payload: dict  # the exact results object returned by analysis endpoints


def get_data(session_id: str):
    data = get_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return data


@router.post("/export/csv")
def export_results_csv(req: ExportRequest):
    _ = get_data(req.session_id)
    return export_csv(req.analysis_type, req.payload)


@router.post("/export/json")
def export_results_json(req: ExportRequest):
    _ = get_data(req.session_id)
    return export_json(req.analysis_type, req.payload)
