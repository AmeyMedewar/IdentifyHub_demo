# 👤 Face Recognition Attendance System

A complete face recognition system using InsightFace (ArcFace) with a Streamlit web interface. Upload images and identify people from your database.

## 🌟 Features

- **State-of-the-art Face Recognition**: Uses InsightFace ArcFace model (99.8% accuracy)
- **Easy Database Creation**: Build your face database from a folder of images
- **Web Interface**: Beautiful Streamlit UI for uploading and recognizing faces
- **Multiple Face Detection**: Recognizes multiple people in one image
- **Real-time Processing**: Fast face detection and recognition
- **GPU Support**: Optional GPU acceleration for faster processing
- **Adjustable Threshold**: Fine-tune recognition sensitivity
- **Visual Results**: Annotated images with bounding boxes and names

## 📋 Requirements

- Python 3.8+
- Webcam or images for testing
- (Optional) NVIDIA GPU with CUDA for faster processing

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project
cd face_recognition_system

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Prepare Your Data

Organize your photos in folders (one folder per person):

```
people_photos/
    ├── John_Doe/
    │   ├── photo1.jpg
    │   ├── photo2.jpg
    │   └── photo3.jpg
    ├── Jane_Smith/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    └── Bob_Johnson/
        ├── photo1.jpg
        └── photo2.jpg
```

**Tips for best results:**
- Use 3-5 photos per person
- Include different angles and expressions
- Use clear, well-lit photos
- Face should be clearly visible
- Avoid sunglasses or face masks

### 3. Build the Database

```bash
# Build database from your photos folder
python build_database.py --folder people_photos

# With GPU acceleration (if available)
python build_database.py --folder people_photos --gpu

# Custom output file
python build_database.py --folder people_photos --output my_database.pkl
```

You should see output like:
```
============================================================
FACE DATABASE BUILDER
============================================================

Input folder: people_photos
Database output: face_database.pkl
Using GPU: False

============================================================

[1/3] Initializing face recognition model...
Model initialized successfully (GPU: False)

[2/3] Processing images from folder...

Processing John_Doe...
  ✓ Processed photo1.jpg
  ✓ Processed photo2.jpg
  ✓ Processed photo3.jpg
  Total embeddings for John_Doe: 3

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
  • Bob_Johnson: 3 embeddings

============================================================
✅ Database built successfully!
============================================================
```

### 4. Run the Streamlit App

```bash
streamlit run streamlit_app.py
```

The app will open in your browser at `http://localhost:8501`

## 📖 Usage Guide

### Using the Web Interface

1. **Upload an Image**: Click "Browse files" and select an image
2. **Adjust Settings** (sidebar):
   - Choose distance metric (cosine recommended)
   - Adjust confidence threshold (0.6 recommended)
   - View database statistics
3. **View Results**:
   - Green boxes = Recognized person
   - Orange boxes = Unknown person
   - Confidence scores shown

### Settings Explained

**Distance Metric:**
- **Cosine** (recommended): Measures angle between vectors. Score range: -1 to 1. Higher = better match.
- **Euclidean**: Measures straight-line distance. Lower = better match.

**Threshold:**
- **Higher threshold** = Stricter matching (fewer false positives, may miss some matches)
- **Lower threshold** = Looser matching (more matches, may include false positives)
- **Recommended**: 0.6 for cosine, 0.8 for euclidean

## 🛠️ Project Structure

```
face_recognition_system/
│
├── face_recognition.py      # Core face recognition module
├── build_database.py         # Database builder script
├── streamlit_app.py          # Streamlit web application
├── requirements.txt          # Python dependencies
├── README.md                 # This file
│
├── face_database.pkl         # Generated database file (after building)
├── people_photos/            # Your photos (you create this)
│   ├── Person1/
│   └── Person2/
└── venv/                     # Virtual environment (optional)
```

## 🔧 Advanced Usage

### Command Line Options

**Build Database:**
```bash
python build_database.py --help

options:
  -h, --help            Show help message
  --folder, -f FOLDER   Path to folder with images (required)
  --output, -o OUTPUT   Output database file (default: face_database.pkl)
  --gpu                 Use GPU for processing
```

### Python API

You can also use the modules directly in your Python code:

```python
from face_recognition import FaceRecognizer, FaceDatabase
import cv2

# Initialize
recognizer = FaceRecognizer(use_gpu=False)
database = FaceDatabase("face_database.pkl")

# Add a person
img = cv2.imread("person.jpg")
embedding = recognizer.get_face_embedding(img)
database.add_person("John Doe", embedding)
database.save_database()

# Recognize a person
test_img = cv2.imread("test.jpg")
test_embedding = recognizer.get_face_embedding(test_img)
name, score = database.search(test_embedding, threshold=0.6)

if name:
    print(f"Recognized: {name} (confidence: {score:.3f})")
else:
    print("Unknown person")
```

## 🎯 Performance

**CPU Mode (Intel i7):**
- Face detection: ~100-200ms per image
- Embedding generation: ~50-100ms per face
- Database search: <1ms

**GPU Mode (NVIDIA GTX 1660):**
- Face detection: ~20-40ms per image
- Embedding generation: ~10-20ms per face
- Database search: <1ms

## 🐛 Troubleshooting

### "No face detected"
- Ensure face is clearly visible
- Check image quality and lighting
- Try a different photo

### "Model initialization failed"
- Check if all dependencies are installed
- Try reinstalling: `pip install --upgrade insightface onnxruntime`

### Low accuracy
- Add more photos per person (3-5 recommended)
- Use photos with different angles/expressions
- Adjust threshold value
- Ensure good image quality

### GPU not working
- Check CUDA installation
- Install GPU version: `pip install onnxruntime-gpu`
- Verify GPU compatibility

## 📊 Model Information

**InsightFace ArcFace:**
- Architecture: ResNet-based
- Embedding dimension: 512
- Accuracy: 99.8% on LFW dataset
- Model size: ~100MB
- Training data: Millions of face images

## 🔐 Privacy & Security

- All processing happens locally on your machine
- No data is sent to external servers
- Face embeddings are stored locally in a pickle file
- You have full control over your data

## 📝 License

This project uses InsightFace library which is licensed under MIT License.

## 🤝 Contributing

Suggestions and improvements are welcome!

## 📧 Support

For issues or questions, please check:
1. This README file
2. Error messages in the console
3. InsightFace documentation: https://github.com/deepinsight/insightface

## 🎓 Educational Use

This project is perfect for:
- Learning face recognition technology
- Building attendance systems
- Creating access control systems
- Academic projects
- Personal photo organization

## ⚠️ Disclaimer

This system is for educational and legitimate purposes only. Ensure compliance with:
- Privacy laws and regulations
- Data protection requirements (GDPR, etc.)
- User consent for face data collection
- Ethical AI guidelines

---

**Happy Face Recognition! 👤🎉**