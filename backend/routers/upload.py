from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()

    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {str(e)}")

    columns = []
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            col_type = "numeric"
        else:
            col_type = "categorical"
        columns.append(
            {"name": col, "type": col_type, "missing": int(df[col].isna().sum())}
        )

    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": columns,
        "preview": df.head(5).fillna("").to_dict(orient="records"),
    }
