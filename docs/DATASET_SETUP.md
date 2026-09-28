# HospitalNet Dataset Setup Guide

HospitalNet simulates three healthcare institutions:
- **Hospital A**: Metro General Hospital (`backend/data/hospital_a/`)
- **Hospital B**: St. Jude Community Clinic (`backend/data/hospital_b/`)
- **Hospital C**: Apex University Medical Center (`backend/data/hospital_c/`)

Each hospital possesses its own private folder with subdirectories:
```text
backend/data/hospital_a/
├── normal/
└── pneumonia/

backend/data/hospital_b/
├── normal/
└── pneumonia/

backend/data/hospital_c/
├── normal/
└── pneumonia/
```

---

## Option 1: Automatic Demo / Synthetic Data Mode (Default - Zero Download Required)

You do **not** need to download anything to immediately run and demonstrate HospitalNet!

When the backend starts up, it automatically inspects the three hospital directories. If any partition is empty, it automatically generates synthetic chest radiographs using procedural thoracic geometry simulation (`create_synthetic_xray()`).

It also creates evaluation samples at:
- `backend/sample_images/sample_normal_xray.png`
- `backend/sample_images/sample_pneumonia_xray.png`

These can be loaded into the prediction UI with a single click.

---

## Option 2: Using the Real Kaggle Chest X-Ray Pneumonia Dataset

If you wish to train on real clinical radiographs (approx. 5,863 images, 1.2 GB):

### Step 1: Download the Dataset
1. Visit Kaggle: [Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)
2. Download and extract the archive to a local folder (e.g. `C:/Users/username/Downloads/chest_xray`).
3. You will see:
   ```text
   chest_xray/
   ├── train/
   │   ├── NORMAL/
   │   └── PNEUMONIA/
   ├── test/
   └── val/
   ```

### Step 2: Run the Automatic Partitioning Script
HospitalNet includes an automated tool to slice the dataset into 3 balanced institutional partitions:

```bash
# In project root:
python scripts/setup_data.py --source "C:/path/to/chest_xray/train"
```

The script will:
1. Scan all `NORMAL` and `PNEUMONIA` images.
2. Distribute images evenly across `backend/data/hospital_a`, `hospital_b`, and `hospital_c` (approx. 33% each).
3. Ensure no data overlaps between hospitals.

---

## Option 3: Manual File Placement
You can manually drop standard `.jpeg` or `.png` chest X-rays into:
- `backend/data/hospital_a/normal/`
- `backend/data/hospital_a/pneumonia/`
- `backend/data/hospital_b/normal/`
- etc.

> **Privacy Note**: As configured in `.gitignore`, image files in `backend/data/` and `backend/uploads/` are never committed to Git version control.
