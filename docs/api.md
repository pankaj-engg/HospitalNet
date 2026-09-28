# HospitalNet REST API Documentation

Base URL: `http://localhost:8000`  
Swagger UI Interactive Documentation: `http://localhost:8000/docs`

---

## 1. System Health

### `GET /api/health`
Returns the operational state of the backend service, model file status, and dataset sample counts.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "HospitalNet",
  "version": "1.0.0",
  "demo_mode": true,
  "model_file_exists": true,
  "model_path": "global_model.pth",
  "hospitals_participating": 3,
  "hospital_partitions": {
    "hospital_a": { "normal_samples": 8, "pneumonia_samples": 8, "total_samples": 16 },
    "hospital_b": { "normal_samples": 8, "pneumonia_samples": 8, "total_samples": 16 },
    "hospital_c": { "normal_samples": 8, "pneumonia_samples": 8, "total_samples": 16 }
  },
  "disclaimer": "HospitalNet is an academic prototype for federated learning research. Not for clinical diagnosis."
}
```

---

## 2. Chest X-Ray Classification (Inference)

### `POST /api/predict`
Accepts a chest X-ray image file (`multipart/form-data`), runs inference via ResNet18, and stores the prediction record in SQLite.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (Binary image file: PNG, JPG, JPEG)

**Response `200 OK`**:
```json
{
  "id": 1,
  "filename": "patient_chest_xray.png",
  "image_path": "/uploads/4a9b21f_patient_chest_xray.png",
  "prediction": "Pneumonia",
  "confidence": 0.9421,
  "probabilities": {
    "Normal": 0.0579,
    "Pneumonia": 0.9421
  },
  "model": "HospitalNet ResNet18 (FedAvg)",
  "is_demo": false,
  "timestamp": "2026-09-28T14:40:00.123456",
  "message": "Inference executed using trained global federated model",
  "disclaimer": "Research prototype only. This result is not a medical diagnosis."
}
```

### `GET /api/predict/samples`
Returns list of pre-configured sample radiographs for rapid one-click UI evaluation.

### `GET /api/predict/sample-image/{sample_name}`
Streams sample image binary for previewing.

---

## 3. Federated Training Coordination

### `POST /api/training/start`
Triggers an asynchronous federated learning training session across Hospital A, B, and C.

**Request Body**:
```json
{
  "rounds": 3,
  "local_epochs": 1,
  "demo_mode": true
}
```

**Response `200 OK`**:
```json
{
  "message": "Federated training session started successfully.",
  "session_id": "fl_sess_a8b9c1d2",
  "total_rounds": 3,
  "local_epochs": 1,
  "demo_mode": true,
  "hospitals_participating": 3
}
```

### `GET /api/training/status`
Returns real-time training progress, active communication round, hospital nodes statuses, and event log entries.

### `GET /api/training/results`
Returns historical list of completed federated training sessions and their convergence metrics.

### `GET /api/training/hospitals`
Returns metadata, specialties, and geographical regions for Hospital A, B, and C.

---

## 4. History and Audit Trail

### `GET /api/history`
Returns paginated list of previous classifications saved in SQLite.
- Query parameters: `limit` (default: 50), `offset` (default: 0)

### `GET /api/history/stats`
Returns aggregated analytics: total tests performed, counts of Normal vs. Pneumonia, and average model confidence.

### `DELETE /api/history/{id}`
Deletes a specific prediction entry by ID.

### `DELETE /api/history`
Clears all saved prediction history.
