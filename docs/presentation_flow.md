# HospitalNet 5–10 Minute Presentation & Live Demo Guide

This document gives you an exact script, timing breakdown, and demonstration sequence for your project review or final-year viva examination.

---

## Presentation Breakdown (Total: ~8 Minutes)

### Minute 1: The Problem Statement & Background
- **Slide / Pitch**: "Respected evaluators, modern deep learning models in healthcare require massive and diverse medical imaging datasets to achieve clinical reliability. However, hospitals cannot legally or ethically pool patient chest radiographs onto a central server due to privacy regulations like HIPAA, GDPR, and data security risks. This creates severe data silos, resulting in isolated models with high bias."

### Minute 2: The Proposed Solution (HospitalNet)
- **Slide / Pitch**: "To solve this, we developed **HospitalNet: A CNN-Based Federated Learning Framework for Privacy-Preserving Medical Image Classification**. In HospitalNet, three simulated hospitals (Hospital A, B, and C) collaboratively train a ResNet18 model using Federated Averaging (FedAvg). Patient X-rays never leave the hospitals. Only mathematical model parameters are transmitted to a central Flower coordinator."

### Minute 3: Architecture & Workflow
- **Open Landing Page / Architecture**:
  - Show the 4-layer architecture:
    1. Edge Medical Nodes (Hospitals A, B, C with private local partitions)
    2. Federated Server (Flower FedAvg aggregator)
    3. FastAPI Backend with SQLite persistence
    4. Next.js Web Dashboard
  - Explain the FedAvg formula:
    $$W_{t+1} = \sum_{k=1}^K \frac{n_k}{N} W_{t+1}^k$$

### Minute 4–5: Live Demonstration — Federated Training
- **Action**: Click **Launch Federated Training** (`/training`).
- **Explanation**:
  1. Show the hyperparameter panel: 3 communication rounds, 1 local epoch per hospital, 3 hospital nodes.
  2. Click **Start Federated Training**.
  3. Point out the live telemetry:
     - Show Round 1/3 beginning.
     - Show Hospital A (Metro General) training on local private X-rays.
     - Show Hospital B (St. Jude) and Hospital C (Apex Medical) updating.
     - Show the Central Server performing FedAvg weight aggregation.
     - Show the real-time accuracy climbing (e.g., from 78% $\rightarrow$ 84% $\rightarrow$ 89%).
     - Show that the resulting model is saved to `backend/models/global_model.pth`.

### Minute 6: Live Demonstration — Chest X-Ray Diagnosis
- **Action**: Click **X-Ray Prediction** (`/predict`).
- **Explanation**:
  1. Click **Load Sample Normal X-ray** or drag & drop an image.
  2. Click **Run Medical Classification**.
  3. Show the instantaneous output:
     - Predicted Class: **Normal** or **Pneumonia**.
     - Confidence Score: (e.g., 94%).
     - Probability distribution bar.
     - Point out the mandatory medical research disclaimer.
  4. Now click **Load Sample Pneumonia X-ray** and run it to demonstrate both classes.

### Minute 7: Database Persistence & History
- **Action**: Click **History** (`/history`).
- **Explanation**:
  - Show that every prediction is logged in SQLite (`hospitalnet.db`) with an auto-incremented record ID, filename, confidence, timestamp, and model version.
  - Show the statistical summary cards (total tests, Normal vs Pneumonia count, mean confidence).
  - Demonstrate individual record deletion or audit clearing.

### Minute 8: Limitations & Future Scope
- **Closing**:
  - "In this academic prototype, we demonstrated the fundamental privacy boundary of FedAvg. For future enhancements, we plan to integrate **Differential Privacy (DP-SGD)**, **Secure Aggregation**, **Grad-CAM visual heatmaps** for radiologist interpretability, and integration with hospital PACS/DICOM systems."
  - "Thank you, we are now ready for questions."
