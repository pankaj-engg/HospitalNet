"""
Hospital B Node Configuration and Client Initialization.

Simulated Node: St. Jude Children & Community Clinic
Specialty: Pediatric and Community Chest Radiology
Partition: backend/data/hospital_b/
"""

from pathlib import Path
from app.config import settings
from app.federated.client import HospitalClient

HOSPITAL_B_INFO = {
    "id": "hospital_b",
    "name": "St. Jude Community Clinic",
    "location": "South Bay Region",
    "specialty": "Pediatric & Community Screening",
    "description": "Suburban regional center with diverse screening population and pediatric X-rays.",
    "data_path": str(settings.DATA_DIR / "hospital_b"),
    "status": "ready"
}

def create_client_b(epochs: int = 1) -> HospitalClient:
    return HospitalClient(
        hospital_id=HOSPITAL_B_INFO["id"],
        data_dir=settings.DATA_DIR / "hospital_b",
        epochs=epochs,
        batch_size=settings.BATCH_SIZE
    )
