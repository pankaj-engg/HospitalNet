"""
Hospital C Node Configuration and Client Initialization.

Simulated Node: Apex University Medical Center
Specialty: Tertiary Research and Diagnostic Imaging
Partition: backend/data/hospital_c/
"""

from pathlib import Path
from app.config import settings
from app.federated.client import HospitalClient

HOSPITAL_C_INFO = {
    "id": "hospital_c",
    "name": "Apex University Medical Center",
    "location": "East Campus Research Hub",
    "specialty": "Tertiary Diagnostics & Academic Radiology",
    "description": "Academic teaching hospital specializing in complex cases and high-resolution imaging.",
    "data_path": str(settings.DATA_DIR / "hospital_c"),
    "status": "ready"
}

def create_client_c(epochs: int = 1) -> HospitalClient:
    return HospitalClient(
        hospital_id=HOSPITAL_C_INFO["id"],
        data_dir=settings.DATA_DIR / "hospital_c",
        epochs=epochs,
        batch_size=settings.BATCH_SIZE
    )
