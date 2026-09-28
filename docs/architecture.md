# HospitalNet System Architecture

## 1. Overview

**HospitalNet** is an end-to-end privacy-preserving deep learning system designed for multi-institutional medical image classification.

The primary objective is to allow multiple simulated hospitals (Hospital A, Hospital B, and Hospital C) to collaboratively train a Convolutional Neural Network (**ResNet18**) for **Pneumonia vs. Normal** chest X-ray detection without ever pooling, uploading, or sharing raw patient images.

```
                    ┌────────────────────────────────────┐
                    │      Central Federated Server      │
                    │        (Flower / FedAvg)           │
                    └──────────────────┬─────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
     ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
     │  Hospital A  │           │  Hospital B  │           │  Hospital C  │
     │ Private Data │           │ Private Data │           │ Private Data │
     │  ResNet18    │           │  ResNet18    │           │  ResNet18    │
     └──────┬───────┘           └──────┬───────┘           └──────┬───────┘
            │                          │                          │
            └──────── Model Weights / Gradients Only ─────────────┘
                                       │
                                       ▼
                    ┌────────────────────────────────────┐
                    │         Global ResNet18            │
                    │   (backend/models/global_model.pth)│
                    └──────────────────┬─────────────────┘
                                       │
                                       ▼
                    ┌────────────────────────────────────┐
                    │         FastAPI REST Backend       │
                    │     (/api/predict, /api/training)  │
                    └──────────────────┬─────────────────┘
                                       │
                                       ▼
                    ┌────────────────────────────────────┐
                    │        Next.js Web Frontend        │
                    │   (Dashboard, Training, Predict)   │
                    └────────────────────────────────────┘
```

---

## 2. Core Architectural Layers

### Layer 1: Edge Medical Nodes (Hospitals A, B, C)
Each simulated hospital maintains:
1. **Private Local Storage**: `backend/data/hospital_{a,b,c}/` contains chest radiographs partitioned into `normal/` and `pneumonia/`.
2. **Local Deep Learning Pipeline**: A local instance of PyTorch `ResNet18` initialized with the current global weights received from the central coordinator.
3. **Local SGD Optimization**: Private training occurs using `Adam(lr=1e-4)` and `CrossEntropyLoss` for `E` local epochs.
4. **Weight Serializer**: Extracts layer weight matrices as NumPy arrays (`get_model_parameters()`). **Raw images never leave the local boundary.**

### Layer 2: Federated Coordinator (Flower FedAvg)
The central coordinator performs:
1. **Weight Distribution**: Sends initial or current global parameters $W_t$ to selected hospital clients.
2. **Parameter Reception**: Collects updated client parameter vectors $W_{t+1}^k$ and private sample counts $n_k$.
3. **FedAvg Aggregation**: Computes sample-weighted average:
   $$W_{t+1} = \sum_{k=1}^K \frac{n_k}{N} W_{t+1}^k \quad \text{where} \quad N = \sum_{k=1}^K n_k$$
4. **Global Checkpoint Persistence**: Saves the aggregated weights to `backend/models/global_model.pth`.

### Layer 3: Backend Application Layer (FastAPI & SQLite)
1. **Inference Engine**: Loads `global_model.pth` into memory, validates incoming radiographs, normalizes pixel tensors to ImageNet specifications $(224 \times 224)$, and returns class probabilities.
2. **Audit Logging**: Persists every prediction timestamp, filename, confidence score, and model version into SQLite (`hospitalnet.db`).
3. **Training Controller**: Manages asynchronous multi-round federated training sessions, streaming live metrics and logs to the client.

### Layer 4: Client Presentation Layer (Next.js & Tailwind CSS)
1. **System Dashboard**: High-level telemetry of participating hospitals, model status, and live convergence metrics.
2. **Federated Training Studio**: Interactive control panel to configure rounds and local epochs, trigger simulations, and observe step-by-step FedAvg progress.
3. **Diagnostic Triage**: Drag-and-drop chest X-ray uploader with instant probability distribution visualizer.
4. **History Audit Table**: Searchable log of past evaluations.

---

## 3. Data Privacy Guarantees & Prototype Scope
- **What is Protected**: Patient chest radiographs are strictly confined to individual hospital partition directories. No raw pixels, DICOM files, or patient metadata are transmitted over the network.
- **What is Transmitted**: High-dimensional numerical weight matrices (parameters of Conv2d, BatchNorm2d, and Linear layers).
- **Academic Scope**: In real-world enterprise deployments, gradient inversion attacks can theoretically reconstruct partial image features from raw gradients. Production systems add **Differential Privacy (DP-SGD)** and **Secure Multi-Party Computation (SMPC)**. In this prototype, FedAvg demonstrates the fundamental privacy barrier.
