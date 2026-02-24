"""
LabRat API — Main application entry point.
Initialises FastAPI, configures CORS, and registers all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, suggest, analysis

app = FastAPI(
    title="LabRat API",
    description="Statistical analysis backend for LabRat — a research-focused data analysis tool.",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(suggest.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "LabRat API is running"}
