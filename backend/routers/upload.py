"""
Upload router — handles CSV file ingestion and initial parsing.
Returns column metadata and the full dataset to the frontend.
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
    - preview of first 5 rows for display
    - full dataset for analysis
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()

    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    # Infer column type and count missing values for each column
    # Infer column type: boolean, numeric, or categorical
    columns = []
    for col in df.columns:
        # Check for boolean columns (true/false strings or actual bools)
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

    # Replace inf values with None
    df = df.replace([float("inf"), float("-inf")], None)

    # Convert to records and sanitise any remaining NaN values
    def sanitise(records):
        """Replace any remaining NaN/None float values with None for JSON safety."""
        import math

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

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": columns,
        "preview": all_records[:5],
        "data": all_records,
    }
