# 🚀 Setup Guide - Face Recognition System

Follow these steps to set up and run the face recognition system.

## Prerequisites

- Python 3.8 or higher
- pip package manager
- (Optional) NVIDIA GPU with CUDA for faster processing

## Step-by-Step Setup

### Step 1: Download the Project

Download or clone this project to your computer.

```bash
cd face_recognition_system
```

### Step 2: Create Virtual Environment (Recommended)

**On Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- streamlit (Web interface)
- insightface (Face recognition model)
- onnxruntime (Model runtime)
- opencv-python (Image processing)
- numpy (Numerical operations)
- Pillow (Image handling)
- scikit-learn (ML utilities)

**Note:** First run will download the face recognition model (~100MB) automatically.

### Step 4: Prepare Your Photo Database

Create a folder structure with your photos:

```
people_photos/
    ├── John_Doe/
    │   ├── photo1.jpg
    │   ├── photo2.jpg
    │   └── photo3.jpg
    ├── Jane_Smith/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    └── Alice_Johnson/
        ├── photo1.jpg
        ├── photo2.jpg
        └── photo3.jpg
```

**Important Tips:**
- ✅ Use 3-5 photos per person
- ✅ Photos should show clear faces
- ✅ Good lighting is important
- ✅ Include different angles/expressions
- ❌ Avoid blurry images
- ❌ Avoid sunglasses or masks
- ❌ Don't use group photos (one person per photo)

### Step 5: Build the Face Database

```bash
python build_database.py --folder people_photos
```

**Expected Output:**
```
============================================================
FACE DATABASE BUILDER
============================================================

Input folder: people_photos
Database output: face_database.pkl
Using GPU: False

============================================================

[1/3] Initializing face recognition model...
Downloading model... (first time only)
Model initialized successfully (GPU: False)

[2/3] Processing images from folder...

Processing John_Doe...
  ✓ Processed photo1.jpg
  ✓ Processed photo2.jpg
  ✓ Processed photo3.jpg
  Total embeddings for John_Doe: 3

Processing Jane_Smith...
  ✓ Processed photo1.jpg
  ✓ Processed photo2.jpg
  Total embeddings for Jane_Smith: 2

...

[3/3] Building database...
Database saved to face_database.pkl

============================================================
DATABASE STATISTICS
============================================================

Total people: 3
Total embeddings: 8

Per person:
  • John_Doe: 3 embeddings
  • Jane_Smith: 2 embeddings
  • Alice_Johnson: 3 embeddings

============================================================
✅ Database built successfully!
============================================================
```

### Step 6: Run the Streamlit App

```bash
streamlit run streamlit_app.py
```

**Expected Output:**
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.1.100:8501
```

The app will automatically open in your browser!

### Step 7: Test the System

1. Click **"Browse files"** in the web interface
2. Upload a photo (of someone in your database or a stranger)
3. Wait for processing (a few seconds)
4. View the results!

**You should see:**
- Green boxes around recognized faces with names
- Orange boxes around unknown faces
- Confidence scores for each detection

## Common Setup Issues

### Issue 1: Module not found

```
ModuleNotFoundError: No module named 'insightface'
```

**Solution:**
```bash
pip install insightface onnxruntime opencv-python numpy
```

### Issue 2: OpenCV import error

```
ImportError: libGL.so.1: cannot open shared object file
```

**Solution (Linux):**
```bash
sudo apt-get update
sudo apt-get install libgl1-mesa-glx
```

### Issue 3: Model download fails

```
Error downloading model
```

**Solution:**
- Check your internet connection
- Try again - it will resume the download
- Use a VPN if you're in a restricted region

### Issue 4: No faces detected

**Possible causes:**
- Poor image quality
- Face too small in the image
- Face not clearly visible
- Wrong image format

**Solution:**
- Use clear, well-lit photos
- Ensure face takes up at least 20% of image
- Use standard formats: .jpg, .png

### Issue 5: Low recognition accuracy

**Solutions:**
- Add more photos per person (3-5 minimum)
- Use photos with different angles
- Ensure good lighting in all photos
- Adjust threshold in the web app
- Re-take photos with better quality

## GPU Setup (Optional, for faster processing)

If you have an NVIDIA GPU:

### 1. Install CUDA Toolkit

Download from: https://developer.nvidia.com/cuda-downloads

### 2. Install GPU-enabled ONNX Runtime

```bash
pip uninstall onnxruntime
pip install onnxruntime-gpu
```

### 3. Verify GPU is working

```python
python
>>> import onnxruntime as ort
>>> print(ort.get_available_providers())
# Should include 'CUDAExecutionProvider'
```

### 4. Use GPU in the app

In the Streamlit app sidebar, check the **"Use GPU"** option.

Or when building database:
```bash
python build_database.py --folder people_photos --gpu
```

## Testing Your Setup

### Quick Test

```bash
python -c "from face_recognition import FaceRecognizer; print('✅ Setup successful!')"
```

### Full Test

```python
from face_recognition import FaceRecognizer, FaceDatabase

# Initialize
recognizer = FaceRecognizer(use_gpu=False)
database = FaceDatabase("face_database.pkl")

print(f"✅ Model loaded successfully")
print(f"✅ Database loaded: {len(database.embeddings)} people")
```

## Next Steps

1. ✅ Build your database with photos
2. ✅ Run the Streamlit app
3. ✅ Test with known and unknown faces
4. ✅ Adjust threshold for best results
5. ✅ Explore example_usage.py for advanced features

## File Locations

After setup, you should have:

```
face_recognition_system/
├── face_recognition.py          # ✅ Core module
├── build_database.py             # ✅ Database builder
├── streamlit_app.py              # ✅ Web app
├── example_usage.py              # ✅ Examples
├── requirements.txt              # ✅ Dependencies
├── README.md                     # ✅ Documentation
├── SETUP_GUIDE.md               # ✅ This file
├── venv/                         # ✅ Virtual environment
├── people_photos/                # 📁 Your photos
└── face_database.pkl             # 💾 Generated database
```

## Performance Expectations

**CPU Mode (Intel i7):**
- Database building: ~2-3 seconds per image
- Real-time recognition: ~1-2 seconds per image
- Suitable for: Small databases (<100 people)

**GPU Mode (NVIDIA GTX 1660):**
- Database building: ~0.5 seconds per image
- Real-time recognition: ~0.2-0.5 seconds per image
- Suitable for: Large databases (100+ people)

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Read error messages carefully
3. Check the README.md for more info
4. Review example_usage.py for code examples
5. Ensure all dependencies are installed
6. Try with different images

## System Requirements

**Minimum:**
- CPU: Intel i5 or equivalent
- RAM: 8GB
- Storage: 2GB free space
- Python: 3.8+

**Recommended:**
- CPU: Intel i7 or equivalent
- RAM: 16GB
- GPU: NVIDIA GTX 1660 or better
- Storage: 5GB free space
- Python: 3.9+

---

**You're all set! Happy face recognizing! 👤✨**