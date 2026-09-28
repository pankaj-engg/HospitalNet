# HospitalNet: A CNN-Based Federated Learning Framework for Privacy-Preserving Medical Image Classification

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch%20%2F%20ResNet18-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org/)
[![Flower](https://img.shields.io/badge/Federated%20Learning-Flower%20FedAvg-FFD000.svg?style=flat)](https://flower.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Academic Project Prototype**  
> Developed for Bachelor of Engineering (BE) Final Year Project & Viva Voce Demonstration.

---

## 1. Overview
**HospitalNet** is a privacy-preserving medical artificial intelligence application designed to classify chest X-ray radiographs into **Normal** vs. **Pneumonia** without exposing confidential patient records to a centralized server. 

By coordinating three simulated hospital nodes (**Hospital A, Hospital B, and Hospital C**) through the **Flower** federated learning framework using the **Federated Averaging (FedAvg)** algorithm, institutions collaboratively train a high-accuracy **ResNet18 Convolutional Neural Network (CNN)** while retaining complete custody of their private datasets.

---

## 2. Problem Statement
1. **Medical Data Silos:** Strict global privacy regulations (HIPAA in the US, GDPR in Europe, and national healthcare privacy laws) prohibit medical centers from transferring patient Protected Health Information (PHI) to third-party cloud data lakes.
2. **Single Point of Failure:** Centralized repositories of medical scans present severe targets for catastrophic data breaches.
3. **Small Local Cohorts:** Individual hospital clinics often possess insufficient radiographic diversity to train deep generalized neural networks independently.

---

## 3. Proposed Solution
HospitalNet implements a decentralized architecture:
- Patient chest X-rays **never leave the local hospital firewall**.
- Each hospital trains a local **ResNet18** model on its private partition.
- Only the **mathematical parameter weights and gradients** are sent to the central coordinator.
- The central server applies **FedAvg** to synthesize a robust global model that is distributed back to the healthcare network.

---

## 4. System Architecture

```text
                    ┌─────────────────────┐
                    │   Central Server    │
                    │    Flower / FedAvg  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Hospital A │   │ Hospital B │   │ Hospital C │
       │ Local Data │   │ Local Data │   │ Local Data │
       │ Local CNN  │   │ Local CNN  │   │ Local CNN  │
       └──────┬─────┘   └──────┬─────┘   └──────┬─────┘
              │                │                │
              └──── Model Weights Only ─────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Global CNN Model  │
                    │       ResNet18       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI API      │
                    │   (SQLite Audit)    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Next.js Web Frontend │
                    │ (Triage & Telemetry)│
                    └─────────────────────┘
```

---

## 5. Technology Stack

### Machine Learning & Federated Learning
- **Python 3.11+ / 3.13**
- **PyTorch & torchvision**: ResNet18 transfer learning with modified binary classification head
- **Flower (`flwr`)**: Distributed federated learning coordinator
- **FedAvg (Federated Averaging)**: Weighted parameter aggregation
- **NumPy, Scikit-learn, Pillow**: Tensor manipulation and preprocessing

### Backend API
- **FastAPI**: Asynchronous Python REST API framework
- **Uvicorn**: High-performance ASGI server
- **SQLite & SQLAlchemy**: Zero-configuration ACID database for prediction audit logs
- **Pydantic**: Type-safe payload validation

### Frontend Presentation
- **Next.js 14 (App Router)**: Server-side rendering and static optimization
- **React & TypeScript**: Interactive component-driven UI
- **Tailwind CSS**: Modern clinical dark-mode design system
- **Lucide React**: Medical & telemetry iconography

---

## 6. Monorepo Project Structure

```text
HospitalNet/
├── README.md                          # Project documentation and guide
├── .gitignore                         # Version control ignore rules
├── LICENSE                            # MIT License
├── docker-compose.yml                 # Multi-container orchestration
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application entrypoint
│   │   ├── config.py                  # Central configuration
│   │   ├── api/routes/
│   │   │   ├── health.py              # Health check & diagnostics
│   │   │   ├── prediction.py          # X-ray inference & sample provider
│   │   │   ├── training.py            # Federated training coordinator
│   │   │   └── history.py             # Prediction history & analytics
│   │   ├── database/
│   │   │   ├── database.py            # SQLite session engine
│   │   │   └── models.py              # SQLAlchemy schemas
│   │   ├── ml/
│   │   │   ├── model.py               # ResNet18 model & weight serialization
│   │   │   ├── preprocessing.py       # Radiograph normalization & validation
│   │   │   ├── inference.py           # Classification & Softmax logic
│   │   │   └── training.py            # Local PyTorch training loops
│   │   └── federated/
│   │       ├── server.py              # Asynchronous FL training coordinator
│   │       ├── client.py              # Flower HospitalClient class
│   │       ├── fedavg.py              # Federated Averaging algorithm
│   │       ├── hospital_a.py          # Hospital A configuration (Metro General)
│   │       ├── hospital_b.py          # Hospital B configuration (St. Jude)
│   │       └── hospital_c.py          # Hospital C configuration (Apex Medical)
│   ├── models/
│   │   └── global_model.pth           # Trained global ResNet18 weights
│   ├── data/
│   │   ├── hospital_a/                # Private partition for Hospital A
│   │   ├── hospital_b/                # Private partition for Hospital B
│   │   └── hospital_c/                # Private partition for Hospital C
│   ├── uploads/                       # User-uploaded radiographs
│   ├── sample_images/                 # Built-in sample test X-rays
│   ├── requirements.txt               # Backend Python dependencies
│   ├── Dockerfile                     # Backend container file
│   └── .env.example                   # Backend environment template
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout & branding
│   │   ├── page.tsx                   # Landing page
│   │   ├── dashboard/page.tsx         # System control center
│   │   ├── training/page.tsx          # Federated training studio
│   │   ├── predict/page.tsx           # X-ray classification interface
│   │   └── history/page.tsx           # SQLite prediction audit log
│   ├── components/
│   │   ├── Navbar.tsx                 # Global navigation & status indicator
│   │   ├── HospitalCard.tsx           # Hospital node status card
│   │   ├── FederatedFlowVisualizer.tsx# Interactive FL architecture diagram
│   │   ├── MetricCard.tsx             # Stat telemetry card
│   │   ├── TrainingProgress.tsx       # Live round progress & console
│   │   ├── ImageUploader.tsx          # Drag-and-drop X-ray uploader
│   │   ├── PredictionCard.tsx         # Diagnosis & confidence display
│   │   └── HistoryTable.tsx           # History table with delete actions
│   ├── lib/
│   │   └── api.ts                     # Typed API client library
│   ├── package.json                   # Frontend dependencies
│   ├── Dockerfile                     # Frontend container file
│   └── .env.local.example             # Frontend environment template
│
├── notebooks/
│   └── federated_training_demo.ipynb  # Interactive Jupyter FL simulation
├── scripts/
│   ├── setup_data.py                  # Kaggle / synthetic data partitioner
│   ├── train_global_model.py          # Standalone training script
│   └── run_federated_learning.py      # Terminal FL simulation runner
│
└── docs/
    ├── architecture.md                # Detailed technical architecture
    ├── federated_learning.md          # FedAvg algorithm mathematical guide
    ├── api.md                         # REST API endpoint reference
    ├── project_flow.md                # End-to-end execution flow
    ├── DATASET_SETUP.md               # Kaggle dataset setup instructions
    ├── viva_questions.md              # 30+ Viva Voce questions & answers
    └── presentation_flow.md           # 5-10 minute project presentation script
```

---

## 7. Quick Start: Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Clone & Set Up Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
uvicorn app.main:app --reload --port 8000
```

Backend will be active at:
- **API URL:** `http://localhost:8000`
- **Swagger Documentation:** `http://localhost:8000/docs`

---

### 2. Set Up & Run Frontend

Open a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend will be active at:
- **Web App:** `http://localhost:3000`

---

## 8. Running Federated Training

### Option A: From Web Browser (Recommended for Viva)
1. Open `http://localhost:3000/training`
2. Select desired rounds (e.g. 3) and local epochs (e.g. 1)
3. Ensure **Demo Simulation** or **Real PyTorch** mode is selected
4. Click **Start Federated Training**
5. Observe:
   - Hospital A, B, and C local training states
   - FedAvg aggregation on the central server
   - Global accuracy and loss progression across rounds
   - Checkpoint saved to `backend/models/global_model.pth`

### Option B: Terminal CLI Runner
```bash
# In project root with active venv:
python scripts/run_federated_learning.py --rounds 3 --epochs 1 --demo
```

---

## 9. Making a Prediction

1. Open `http://localhost:3000/predict`
2. Either drag-and-drop a chest radiograph or click **Load Normal Sample** / **Load Pneumonia Sample**
3. Click **Run Medical Classification**
4. Review the diagnosis:
   - Predicted Label (**Normal** vs. **Pneumonia**)
   - Model Confidence percentage
   - Softmax probability distribution
   - Confirmation of SQLite audit log persistence
5. Navigate to `http://localhost:3000/history` to view the stored audit record.

---

## 10. Demo Mode vs. Real Training Mode

HospitalNet includes a clearly labeled **Demo Mode** flag:
- `DEMO_MODE=true` (Default in `.env`): Enables fast simulation of federated rounds in 10-15 seconds for effortless classroom and viva demonstration without heavy GPU requirements.
- `DEMO_MODE=false`: Performs actual PyTorch forward/backward passes and Flower parameter serialization over local dataset partitions.

---

## 11. Screenshots Section (Placeholder)

| Dashboard View | Federated Training Studio |
| :---: | :---: |
| *(Control Center Telemetry)* | *(Live Round-by-Round FedAvg)* |

| Prediction Interface | History Audit Log |
| :---: | :---: |
| *(ResNet18 Triage & Confidence)* | *(SQLite Stored Records)* |

---

## 12. Limitations & Future Scope

### Limitations in Current Prototype
1. **Simulated Institutional Nodes**: Hospitals A, B, and C execute on separate local folders rather than physically isolated geographically distributed servers.
2. **Basic Privacy Boundary**: FedAvg prevents raw data sharing; however, production medical systems require Differential Privacy to guard against gradient inversion.

### Future Scope
- **Differential Privacy (DP-SGD)**: Add calibrated Gaussian noise to parameter updates to guarantee bounded privacy loss ($\epsilon$).
- **Secure Aggregation (SecAgg)**: Cryptographic multi-party computation ensuring the server only observes $\sum W_k$.
- **Explainable AI (Grad-CAM)**: Heatmap visualization highlighting consolidation areas in lung zones for radiologist validation.
- **Vision Transformers (ViT)**: Exploring Swin Transformer or ViT-Base backbones.

---

## 13. Mandatory Research Disclaimer

> **IMPORTANT MEDICAL NOTICE**  
> HospitalNet is an academic engineering research prototype developed for educational and demonstration purposes. Predictions generated by this system are NOT certified medical diagnoses and must NEVER be used for clinical decision-making, patient triage, or prescribing treatment.

---

## 14. Authors & Academic Credits
- Final Year B.E. Computer Science / Information Technology Project
- Implemented using **Flower**, **PyTorch**, **FastAPI**, and **Next.js**.
