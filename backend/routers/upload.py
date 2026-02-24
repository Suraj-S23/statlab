"""
Upload router — handles CSV file ingestion and initial parsing.
Stores the full dataset in Redis and returns a session ID to the frontend.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import math
from utils.session import create_session

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Accept a CSV file, parse it with pandas, store the full dataset
    in Redis, and return:
    - session_id for subsequent analysis requests
    - filename and row count
    - column names, inferred types, and missing value counts
    - preview of the first 5 rows for display
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()

    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    # Infer column type: boolean, numeric, or categorical
    columns = []
    for col in df.columns:
        raw_vals = df[col].dropna().unique()
        is_bool = set(str(v).lower() for v in raw_vals).issubset(
            {"true", "false", "0", "1"}
        )

        if df[col].dtype == bool or (is_bool and len(raw_vals) <= 2):
            col_type = "boolean"
        elif pd.api.types.is_numeric_dtype(df[col]):
            col_type = "numeric"
        else:
            col_type = "categorical"

        columns.append(
            {"name": col, "type": col_type, "missing": int(df[col].isna().sum())}
        )

    # Sanitise values for JSON compatibility
    df = df.replace([float("inf"), float("-inf")], None)

    def sanitise(records):
        """Replace NaN float values with None for JSON safety."""
        cleaned = []
        for row in records:
            cleaned_row = {}
            for k, v in row.items():
                if isinstance(v, float) and math.isnan(v):
                    cleaned_row[k] = None
                else:
                    cleaned_row[k] = v
            cleaned.append(cleaned_row)
        return cleaned

    all_records = sanitise(df.to_dict(orient="records"))

    # Store full dataset in Redis, get back a session ID
    session_id = create_session(all_records)

    return {
        "session_id": session_id,
        "filename": file.filename,
        "rows": len(df),
        "columns": columns,
        "preview": all_records[:5],
    }
