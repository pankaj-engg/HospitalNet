"""
Main FastAPI Application Entrypoint for HospitalNet.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.database import init_db
from app.ml.training import (
    ensure_sample_evaluation_images,
    ensure_hospital_dataset
)
from app.api.routes import health, prediction, training, history

# Ensure tables exist on load
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle handler."""
    init_db()
    ensure_sample_evaluation_images()
    for h in ["hospital_a", "hospital_b", "hospital_c"]:
        ensure_hospital_dataset(h, min_samples_per_class=6)
    yield

app = FastAPI(
    title="HospitalNet API",
    description=(
        "HospitalNet: A CNN-Based Federated Learning Framework "
        "for Privacy-Preserving Medical Image Classification. "
        "Simulates multi-hospital collaborative ResNet18 training using FedAvg."
    ),
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for seamless local dev & demos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directories for uploads and sample images
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")
app.mount("/sample_images", StaticFiles(directory=str(settings.SAMPLE_DIR)), name="sample_images")

# Register API Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)
app.include_router(training.router, prefix=settings.API_PREFIX)
app.include_router(history.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to HospitalNet API - Federated Learning for Medical Image Classification",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "demo_mode": settings.DEMO_MODE,
        "disclaimer": "Academic prototype only. Not for clinical diagnosis."
    }
