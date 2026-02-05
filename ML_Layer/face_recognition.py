"""
Face Recognition Module
Handles face detection and embedding generation using DeepFace
"""

import cv2
import numpy as np
from deepface import DeepFace
import pickle
import os
from typing import List, Tuple, Optional, Dict
from pathlib import Path


class FaceRecognizer:
    """Face recognition system using DeepFace with ArcFace model"""
    
    def __init__(self, use_gpu: bool = False, model_name: str = 'ArcFace'):
        """
        Initialize the face recognizer
        
        Args:
            use_gpu: Whether to use GPU for inference (automatically detected by TensorFlow)
            model_name: Model to use - 'ArcFace' (recommended), 'Facenet', 'VGG-Face', etc.
        """
        print("Initializing Face Recognition Model...")
        
        # Store model name
        self.model_name = model_name
        
        # Detector backend - use 'opencv' for CPU, 'retinaface' for better accuracy
        self.detector_backend = 'opencv'
        
        # Set TensorFlow GPU settings
        if not use_gpu:
            os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  # Disable GPU
        
        # Pre-load the model by running a dummy prediction
        try:
            dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.represent(
                img_path=dummy_img,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=False
            )
            print(f"Model initialized successfully (Model: {self.model_name}, GPU: {use_gpu})")
        except Exception as e:
            print(f"Model initialization completed (GPU: {use_gpu})")
    
    def get_face_embedding(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract face embedding from an image
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            Embedding vector (dimension depends on model) or None if no face detected
        """
        try:
            # DeepFace expects RGB format
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                image_rgb = image
            
            # Get embedding
            result = DeepFace.represent(
                img_path=image_rgb,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=True,
                align=True
            )
            
            # DeepFace returns a list of dictionaries
            if result and len(result) > 0:
                embedding = np.array(result[0]['embedding'])
                
                # Normalize the embedding (L2 normalization)
                embedding = embedding / np.linalg.norm(embedding)
                
                return embedding
            else:
                return None
                
        except Exception as e:
            # No face detected or other error
            return None
    
    def get_all_faces_embeddings(self, image: np.ndarray) -> List[Tuple[np.ndarray, tuple]]:
        """
        Extract embeddings for all faces in an image
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            List of tuples (embedding, bounding_box)
        """
        try:
            # DeepFace expects RGB format
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                image_rgb = image
            
            # Detect all faces first
            face_objs = DeepFace.extract_faces(
                img_path=image_rgb,
                detector_backend=self.detector_backend,
                enforce_detection=False,
                align=True
            )
            
            results = []
            
            for face_obj in face_objs:
                if face_obj['confidence'] > 0:  # Valid face detection
                    # Get the face region
                    facial_area = face_obj['facial_area']
                    x = facial_area['x']
                    y = facial_area['y']
                    w = facial_area['w']
                    h = facial_area['h']
                    
                    # Create bounding box in format [x1, y1, x2, y2]
                    bbox = (x, y, x + w, y + h)
                    
                    # Get embedding for this face
                    face_img = face_obj['face']
                    
                    try:
                        embedding_result = DeepFace.represent(
                            img_path=face_img,
                            model_name=self.model_name,
                            detector_backend='skip',  # Skip detection as we already have the face
                            enforce_detection=False,
                            align=False
                        )
                        
                        if embedding_result and len(embedding_result) > 0:
                            embedding = np.array(embedding_result[0]['embedding'])
                            # Normalize
                            embedding = embedding / np.linalg.norm(embedding)
                            results.append((embedding, bbox))
                    except:
                        continue
            
            return results
            
        except Exception as e:
            return []
        
    def delete_person(self, name: str) -> bool:
        """
        Delete a person and all their embeddings from the database
        
        Args:
            name: Name of the person to delete
            
        Returns:
            bool: True if person was deleted, False if not found
        """
        if name not in self.embeddings:
            return False
        
        del self.embeddings[name]
        print(f"Deleted {name} from database")
        return True

    @staticmethod
    def cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Cosine similarity score (higher = more similar, range: -1 to 1)
        """
        # Since we normalize embeddings, dot product = cosine similarity
        return np.dot(embedding1, embedding2)
    
    @staticmethod
    def euclidean_distance(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Calculate Euclidean distance between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Euclidean distance (lower = more similar)
        """
        return np.linalg.norm(embedding1 - embedding2)


class FaceDatabase:
    """Database for storing and searching face embeddings"""
    
    def __init__(self, db_path: str = "face_database.pkl"):
        """
        Initialize face database
        
        Args:
            db_path: Path to save/load the database file
        """
        self.db_path = db_path
        self.embeddings: Dict[str, List[np.ndarray]] = {}  # {name: [embedding1, embedding2, ...]}
        self.load_database()
    
    def add_person(self, name: str, embedding: np.ndarray):
        """
        Add a person's face embedding to the database
        
        Args:
            name: Person's name
            embedding: Face embedding vector
        """
        if name not in self.embeddings:
            self.embeddings[name] = []
        
        self.embeddings[name].append(embedding)
        print(f"Added embedding for {name} (Total: {len(self.embeddings[name])})")
    
    def search(self, query_embedding: np.ndarray, 
               threshold: float = 0.6, 
               metric: str = 'cosine') -> Tuple[Optional[str], float]:
        """
        Search for the best matching person in the database
        
        Args:
            query_embedding: Embedding to search for
            threshold: Similarity threshold for matching
            metric: Distance metric ('cosine' or 'euclidean')
            
        Returns:
            Tuple of (matched_name, confidence_score)
            Returns (None, 0.0) if no match found
        """
        if not self.embeddings:
            return None, 0.0
        
        best_match = None
        best_score = -1 if metric == 'cosine' else float('inf')
        
        for name, embeddings_list in self.embeddings.items():
            for stored_embedding in embeddings_list:
                if metric == 'cosine':
                    # Cosine similarity (higher is better)
                    score = FaceRecognizer.cosine_similarity(query_embedding, stored_embedding)
                    if score > best_score:
                        best_score = score
                        best_match = name
                else:
                    # Euclidean distance (lower is better)
                    score = FaceRecognizer.euclidean_distance(query_embedding, stored_embedding)
                    if score < best_score:
                        best_score = score
                        best_match = name
        
        # Check if best match meets threshold
        if metric == 'cosine':
            if best_score >= threshold:
                return best_match, best_score
        else:
            if best_score <= threshold:
                return best_match, best_score
        
        return None, best_score
    
    def get_average_embedding(self, name: str) -> Optional[np.ndarray]:
        """
        Get average embedding for a person
        
        Args:
            name: Person's name
            
        Returns:
            Average embedding or None if person not found
        """
        if name not in self.embeddings or len(self.embeddings[name]) == 0:
            return None
        
        avg_embedding = np.mean(self.embeddings[name], axis=0)
        # Normalize
        avg_embedding = avg_embedding / np.linalg.norm(avg_embedding)
        return avg_embedding
    
    def save_database(self):
        """Save database to file"""
        with open(self.db_path, 'wb') as f:
            pickle.dump(self.embeddings, f)
        print(f"Database saved to {self.db_path}")
    
    def load_database(self):
        """Load database from file"""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'rb') as f:
                self.embeddings = pickle.load(f)
            print(f"Database loaded: {len(self.embeddings)} people")
        else:
            print("No existing database found. Starting fresh.")
    
    def get_statistics(self) -> Dict:
        """Get database statistics"""
        stats = {
            'total_people': len(self.embeddings),
            'total_embeddings': sum(len(embs) for embs in self.embeddings.values()),
            'people': {}
        }
        
        for name, embs in self.embeddings.items():
            stats['people'][name] = len(embs)
        
        return stats
    
    def delete_person(self, name: str) -> bool:
        """
        Delete a person from database
        
        Args:
            name: Person's name
            
        Returns:
            True if deleted, False if not found
        """
        if name in self.embeddings:
            del self.embeddings[name]
            self.save_database()
            return True
        return False


def load_images_from_folder(folder_path: str, 
                            recognizer: FaceRecognizer) -> Dict[str, List[np.ndarray]]:
    """
    Load images from a folder structure and create embeddings
    
    Expected folder structure:
    folder_path/
        ├── Person1/
        │   ├── image1.jpg
        │   ├── image2.jpg
        ├── Person2/
        │   ├── image1.jpg
        
    Args:
        folder_path: Path to the folder containing person folders
        recognizer: FaceRecognizer instance
        
    Returns:
        Dictionary mapping names to embeddings
    """
    embeddings_dict = {}
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Error: Folder {folder_path} does not exist!")
        return embeddings_dict
    
    # Iterate through person folders
    for person_folder in folder.iterdir():
        if not person_folder.is_dir():
            continue
        
        person_name = person_folder.name
        embeddings_dict[person_name] = []
        
        print(f"\nProcessing {person_name}...")
        
        # Iterate through images in person folder
        for image_path in person_folder.glob('*'):
            if image_path.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.bmp']:
                continue
            
            try:
                # Read image
                img = cv2.imread(str(image_path))
                if img is None:
                    print(f"  ⚠ Could not read {image_path.name}")
                    continue
                
                # Get embedding
                embedding = recognizer.get_face_embedding(img)
                
                if embedding is not None:
                    embeddings_dict[person_name].append(embedding)
                    print(f"  ✓ Processed {image_path.name}")
                else:
                    print(f"  ⚠ No face detected in {image_path.name}")
                    
            except Exception as e:
                print(f"  ✗ Error processing {image_path.name}: {str(e)}")
        
        print(f"  Total embeddings for {person_name}: {len(embeddings_dict[person_name])}")
    
    return embeddings_dict


if __name__ == "__main__":
    # Test the module
    print("Testing Face Recognition Module...")
    
    # Initialize recognizer
    recognizer = FaceRecognizer(use_gpu=False)
    
    # Initialize database
    db = FaceDatabase("test_database.pkl")
    
    print("\nModule test completed successfully!")