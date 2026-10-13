"""
Main FastAPI application module for GST Intelligence System.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.api.routers.system import router as system_router
from src.api.routers.invoices import router as invoices_router
from src.api.routers.reviews import router as reviews_router
from src.api.routers.gstr1 import router as gstr1_router
from src.api.routers.evaluation import router as evaluation_router

load_dotenv()

app = FastAPI(
    title="GST Invoice Intelligence API",
    description="Deterministic GST Validation, Multi-Factor Confidence Scoring, and GSTR-1 Draft Preparation API",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server default ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(system_router)
app.include_router(invoices_router)
app.include_router(reviews_router)
app.include_router(gstr1_router)
app.include_router(evaluation_router)

@app.get("/")
def root():
    return {
        "name": "GST Invoice Intelligence System API Bridge",
        "version": "1.0.0",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": [
            "/api/health",
            "/api/providers",
            "/api/invoices/samples",
            "/api/invoices/upload",
            "/api/invoices/process",
            "/api/reviews/all",
            "/api/gstr1/draft",
            "/api/gstr1/exports/{export_type}",
            "/api/evaluation/metrics",
            "/api/evaluation/performance",
            "/api/architecture/summary"
        ]
    }
