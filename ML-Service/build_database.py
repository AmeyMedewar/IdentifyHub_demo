"""
Build Face Database from Folder
This script processes a folder of images and creates a face database
"""

import argparse
import sys
from pathlib import Path
from face_recognition import FaceRecognizer, FaceDatabase, load_images_from_folder


def build_database(folder_path: str, 
                   database_path: str = "face_database.pkl",
                   use_gpu: bool = False):
    """
    Build face database from a folder of images
    
    Args:
        folder_path: Path to folder containing person subdirectories
        database_path: Path to save the database
        use_gpu: Whether to use GPU
    """
    print("="*60)
    print("FACE DATABASE BUILDER")
    print("="*60)
    print(f"\nInput folder: {folder_path}")
    print(f"Database output: {database_path}")
    print(f"Using GPU: {use_gpu}")
    print("\n" + "="*60)
    
    # Initialize face recognizer
    print("\n[1/3] Initializing face recognition model...")
    recognizer = FaceRecognizer(use_gpu=use_gpu)
    
    # Load images and create embeddings
    print("\n[2/3] Processing images from folder...")
    embeddings_dict = load_images_from_folder(folder_path, recognizer)
    
    if not embeddings_dict:
        print("\n❌ No faces found! Please check your folder structure.")
        print("\nExpected structure:")
        print("  folder_path/")
        print("    ├── Person1/")
        print("    │   ├── image1.jpg")
        print("    │   ├── image2.jpg")
        print("    ├── Person2/")
        print("    │   ├── image1.jpg")
        return False
    
    # Build database
    print("\n[3/3] Building database...")
    db = FaceDatabase(database_path)
    
    total_embeddings = 0
    for name, embeddings in embeddings_dict.items():
        for embedding in embeddings:
            db.add_person(name, embedding)
            total_embeddings += 1
    
    # Save database
    db.save_database()
    
    # Print statistics
    print("\n" + "="*60)
    print("DATABASE STATISTICS")
    print("="*60)
    stats = db.get_statistics()
    print(f"\nTotal people: {stats['total_people']}")
    print(f"Total embeddings: {stats['total_embeddings']}")
    print("\nPer person:")
    for name, count in stats['people'].items():
        print(f"  • {name}: {count} embeddings")
    
    print("\n" + "="*60)
    print("✅ Database built successfully!")
    print("="*60)
    
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Build face recognition database from folder of images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example usage:
  python build_database.py --folder ./people_photos
  python build_database.py --folder ./people_photos --gpu
  python build_database.py --folder ./people_photos --output custom_db.pkl

Folder structure:
  people_photos/
    ├── John_Doe/
    │   ├── photo1.jpg
    │   ├── photo2.jpg
    ├── Jane_Smith/
    │   ├── photo1.jpg
        """
    )
    
    parser.add_argument(
        '--folder', '-f',
        type=str,
        required=True,
        help='Path to folder containing person subdirectories with images'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='face_database.pkl',
        help='Output database file path (default: face_database.pkl)'
    )
    
    parser.add_argument(
        '--gpu',
        action='store_true',
        help='Use GPU for processing (requires CUDA)'
    )
    
    args = parser.parse_args()
    
    # Check if folder exists
    if not Path(args.folder).exists():
        print(f"❌ Error: Folder '{args.folder}' does not exist!")
        sys.exit(1)
    
    # Build database
    success = build_database(args.folder, args.output, args.gpu)
    
    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()