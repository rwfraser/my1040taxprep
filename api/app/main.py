"""
my1040taxprep API — FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import returns, forms, schema

app = FastAPI(
    title="my1040taxprep API",
    version="1.0.0",
    description="Tax return preparation API — accepts form data, runs calculations, generates filled IRS PDFs.",
    root_path="/2023",
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(returns.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(schema.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
