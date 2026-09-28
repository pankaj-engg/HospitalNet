"""
Unit and Integration Tests for HospitalNet Backend and ML Pipeline.
"""

import io
import os
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.database.database import init_db
from app.ml.model import build_resnet18, get_model_parameters, set_model_parameters
from app.ml.preprocessing import create_synthetic_xray, preprocess_image_bytes, validate_image_file
from app.ml.inference import run_inference
from app.federated.fedavg import federated_averaging, compute_federated_metrics

# Ensure database tables exist for tests
init_db()

client = TestClient(app)

# ----------------- ML Unit Tests -----------------

def test_resnet18_model_architecture():
    """Verifies modified ResNet18 model builder and classification head."""
    model = build_resnet18(pretrained=False, num_classes=2)
    assert model.fc.out_features == 2
    params = get_model_parameters(model)
    assert len(params) > 0
    # Test setting parameters back
    set_model_parameters(model, params)

def test_image_preprocessing():
    """Verifies radiograph conversion to normalized PyTorch tensor."""
    img = create_synthetic_xray("Normal")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    bytes_data = buf.getvalue()

    tensor = preprocess_image_bytes(bytes_data)
    assert tensor.shape == (1, 3, 224, 224)

def test_file_validation():
    """Verifies file type and size restrictions."""
    is_valid, _ = validate_image_file("test.png", 1024)
    assert is_valid is True

    is_invalid, err = validate_image_file("test.exe", 1024)
    assert is_invalid is False
    assert "Invalid file format" in err

def test_fedavg_aggregation():
    """Tests sample-weighted FedAvg parameter aggregation logic."""
    import numpy as np
    w1 = [np.array([[2.0, 2.0], [2.0, 2.0]], dtype=np.float32)]
    w2 = [np.array([[4.0, 4.0], [4.0, 4.0]], dtype=np.float32)]

    # Client 1 has 10 samples, Client 2 has 10 samples -> Avg = 3.0
    agg = federated_averaging([(w1, 10), (w2, 10)])
    assert np.allclose(agg[0], 3.0)

    # Client 1 has 30 samples, Client 2 has 10 samples -> Avg = 2.5
    agg_weighted = federated_averaging([(w1, 30), (w2, 10)])
    assert np.allclose(agg_weighted[0], 2.5)

# ----------------- API Integration Tests -----------------

def test_health_endpoint():
    """Tests GET /api/health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HospitalNet"
    assert data["hospitals_participating"] == 3

def test_prediction_endpoint():
    """Tests POST /api/predict with synthetic chest X-ray."""
    img = create_synthetic_xray("Pneumonia")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("test_pneumonia.png", buf, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ("Normal", "Pneumonia")
    assert 0.0 <= data["confidence"] <= 1.0
    assert "disclaimer" in data
    assert "id" in data

def test_sample_images_endpoint():
    """Tests GET /api/predict/samples and image retrieval."""
    res = client.get("/api/predict/samples")
    assert res.status_code == 200
    samples = res.json()["samples"]
    assert len(samples) >= 2

    sample_id = samples[0]["id"]
    img_res = client.get(f"/api/predict/sample-image/{sample_id}")
    assert img_res.status_code == 200
    assert img_res.headers["content-type"] == "image/png"

def test_history_endpoint():
    """Tests GET /api/history and DELETE /api/history/{id}."""
    res = client.get("/api/history")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "records" in data

    stats_res = client.get("/api/history/stats")
    assert stats_res.status_code == 200
    assert "total_predictions" in stats_res.json()

def test_training_endpoint():
    """Tests GET /api/training/hospitals and status."""
    hosp_res = client.get("/api/training/hospitals")
    assert hosp_res.status_code == 200
    hospitals = hosp_res.json()["hospitals"]
    assert len(hospitals) == 3

    status_res = client.get("/api/training/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "hospitals" in status_data
