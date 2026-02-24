"""
StatLab API - Main application entry point.
Initialises FastAPI, configures CORS, and registers all routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, suggest, analysis

app = FastAPI(
    title="StatLab API",
    description="Statistical analysis backend for StatLab — a research-focused data analysis tool.",
    version="0.1.0",
)

# Allow requests from the React frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api prefix
app.include_router(upload.router, prefix="/api")
app.include_router(suggest.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "StatLab API is running"}
