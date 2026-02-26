# backend/services/export.py
from __future__ import annotations

import csv
import io
import json
from typing import Any, Dict, List, Tuple

from fastapi import Response
from fastapi.responses import StreamingResponse


def _payload_to_csv(payload: Any) -> Tuple[List[str], List[Dict[str, str]]]:
    """
    Convert an arbitrary JSON-like payload into a CSV header + rows.

    Handles:
    - list[dict] -> normal table
    - dict with a table-ish list under common keys -> normal table
    - dict -> key/value table
    - anything else -> single-cell table
    """
    # 1) list[dict]
    if isinstance(payload, list) and all(isinstance(x, dict) for x in payload):
        fieldnames = sorted({k for row in payload for k in row.keys()})
        rows: List[Dict[str, str]] = []
        for row in payload:
            rows.append(
                {
                    k: (
                        json.dumps(row.get(k), ensure_ascii=False)
                        if row.get(k) is not None
                        else ""
                    )
                    for k in fieldnames
                }
            )
        return fieldnames, rows

    # 2) dict with embedded list[dict]
    if isinstance(payload, dict):
        for k in ("table", "rows", "data", "results"):
            v = payload.get(k)
            if isinstance(v, list) and all(isinstance(x, dict) for x in v):
                fieldnames = sorted({kk for row in v for kk in row.keys()})
                rows = [
                    {
                        kk: (
                            json.dumps(row.get(kk), ensure_ascii=False)
                            if row.get(kk) is not None
                            else ""
                        )
                        for kk in fieldnames
                    }
                    for row in v
                ]
                return fieldnames, rows

        # 3) dict -> key/value
        return ["key", "value"], [
            {"key": str(k), "value": json.dumps(v, ensure_ascii=False)}
            for k, v in payload.items()
        ]

    # 4) fallback
    return ["value"], [{"value": json.dumps(payload, ensure_ascii=False)}]


def export_csv(analysis_type: str, payload: dict) -> StreamingResponse:
    filename = f"labrat_{analysis_type}.csv"

    fieldnames, rows = _payload_to_csv(payload)

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=fieldnames)
    writer.writeheader()
    for r in rows:
        writer.writerow(r)

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def export_json(analysis_type: str, payload: dict) -> Response:
    filename = f"labrat_{analysis_type}.json"
    content = json.dumps(payload, ensure_ascii=False, indent=2)
    return Response(
        content=content,
        media_type="application/json; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
