"""
Upload router — handles CSV file ingestion and initial parsing.
Returns column metadata and a data preview to the frontend.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Accept a CSV file, parse it with pandas, and return:
    - filename and row count
    - column names, inferred types (numeric/categorical), and missing value counts
    - a preview of the first 5 rows
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()

    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    # Infer column type and count missing values for each column
    columns = []
    for col in df.columns:
        col_type = (
            "numeric" if pd.api.types.is_numeric_dtype(df[col]) else "categorical"
        )
        columns.append(
            {"name": col, "type": col_type, "missing": int(df[col].isna().sum())}
        )

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": columns,
        # Replace NaN with empty string so JSON serialisation doesn't fail
        "preview": df.head(5).fillna("").to_dict(orient="records"),
    }
