# HospitalNet End-to-End Project Execution Flow

This document details the lifecycle and sequence of interactions across the system during a complete run.

```text
 1. User Opens Browser (http://localhost:3000)
             │
             ▼
 2. Dashboard Page Loads
    ├── Fetches GET /api/health (Verifies 3 hospitals ready)
    └── Fetches GET /api/training/status (Checks model state)
             │
             ▼
 3. User Navigates to /training
    ├── Selects Rounds (3) and Local Epochs (1)
    └── Clicks "Start Federated Training"
             │
             ▼
 4. Backend Spawns Federated Session Thread
    ├── Initializes ResNet18 Global Model
    ├── Distributes weights W_0 to Hospital A, B, C
    ├── Hospital A: Local PyTorch SGD on Partition A -> Returns W_1^A
    ├── Hospital B: Local PyTorch SGD on Partition B -> Returns W_1^B
    ├── Hospital C: Local PyTorch SGD on Partition C -> Returns W_1^C
    ├── Central Server: Computes FedAvg: W_1 = Σ (n_k / N) * W_1^k
    ├── Evaluates accuracy across rounds (e.g. 78% -> 84% -> 89%)
    └── Persists final weights to backend/models/global_model.pth
             │
             ▼
 5. User Navigates to /predict
    ├── Drags and drops a Chest X-ray or selects pre-loaded sample
    └── Clicks "Run Medical Classification"
             │
             ▼
 6. Inference Pipeline Executes
    ├── Validates image format and file size
    ├── Converts single-channel/RGB X-ray to 224x224 normalized tensor
    ├── Evaluates through global_model.pth (ResNet18)
    ├── Computes Softmax probabilities for Normal vs. Pneumonia
    └── Saves prediction record into SQLite database (hospitalnet.db)
             │
             ▼
 7. Result Rendered in UI
    ├── Displays Class (Normal or Pneumonia)
    ├── Displays Confidence gauge (e.g., 94%)
    ├── Displays Softmax distribution bar
    └── Renders mandatory academic research disclaimer
             │
             ▼
 8. User Views /history
    ├── Displays audit table of all evaluated radiographs
    ├── Displays SQLite ID, timestamp, confidence, and model version
    └── Allows individual deletion or history clearing
```
