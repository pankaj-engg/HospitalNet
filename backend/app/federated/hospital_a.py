"""
Hospital A Node Configuration and Client Initialization.

Simulated Node: Metro General Hospital
Specialty: Urban Pulmonology and General Medicine
Partition: backend/data/hospital_a/
"""

from pathlib import Path
from app.config import settings
from app.federated.client import HospitalClient

HOSPITAL_A_INFO = {
    "id": "hospital_a",
    "name": "Metro General Hospital",
    "location": "North District",
    "specialty": "Acute Respiratory & Emergency Care",
    "description": "Large urban medical center with high volume of acute pneumonia presentations.",
    "data_path": str(settings.DATA_DIR / "hospital_a"),
    "status": "ready"
}

def create_client_a(epochs: int = 1) -> HospitalClient:
    return HospitalClient(
        hospital_id=HOSPITAL_A_INFO["id"],
        data_dir=settings.DATA_DIR / "hospital_a",
        epochs=epochs,
        batch_size=settings.BATCH_SIZE
    )
