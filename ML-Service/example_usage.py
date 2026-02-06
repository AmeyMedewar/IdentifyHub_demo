"""
Example Usage of Face Recognition System
This file demonstrates various ways to use the face recognition modules
"""

import cv2
import numpy as np
from face_recognition import FaceRecognizer, FaceDatabase, load_images_from_folder


def example_1_basic_recognition():
    """Example 1: Basic face recognition"""
    print("\n" + "=" * 60)
    print("EXAMPLE 1: Basic Face Recognition")
    print("=" * 60)

    # Initialize recognizer
    recognizer = FaceRecognizer(use_gpu=False)

    # Initialize database
    database = FaceDatabase("face_database.pkl")

    # Load and process an image
    image_path = "test_image.jpg"
    img = cv2.imread(image_path)

    if img is None:
        print(f"Could not load image: {image_path}")
        return

    # Get embedding
    embedding = recognizer.get_face_embedding(img)

    if embedding is None:
        print("No face detected in the image")
        return

    # Search in database
    name, score = database.search(embedding, threshold=0.6, metric="cosine")

    if name:
        print(f"✅ Recognized: {name}")
        print(f"   Confidence: {score:.4f}")
    else:
        print(f"❌ Unknown person")
        print(f"   Best score: {score:.4f}")


def example_2_add_new_person():
    """Example 2: Add a new person to the database"""
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Add New Person to Database")
    print("=" * 60)

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)
    database = FaceDatabase("face_database.pkl")

    # Person's name
    person_name = "New Person"

    # Load multiple images of the person
    image_paths = ["new_person_1.jpg", "new_person_2.jpg", "new_person_3.jpg"]

    added_count = 0
    for img_path in image_paths:
        img = cv2.imread(img_path)
        if img is None:
            print(f"⚠️  Could not load: {img_path}")
            continue

        embedding = recognizer.get_face_embedding(img)
        if embedding is not None:
            database.add_person(person_name, embedding)
            added_count += 1
            print(f"✓ Added embedding from {img_path}")
        else:
            print(f"⚠️  No face in {img_path}")

    # Save database
    if added_count > 0:
        database.save_database()
        print(f"\n✅ Added {added_count} embeddings for {person_name}")
    else:
        print("\n❌ No embeddings were added")


def example_3_batch_recognition():
    """Example 3: Process multiple images in batch"""
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Batch Recognition")
    print("=" * 60)

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)
    database = FaceDatabase("face_database.pkl")

    # List of images to process
    test_images = ["test1.jpg", "test2.jpg", "test3.jpg"]

    results = []

    for img_path in test_images:
        img = cv2.imread(img_path)
        if img is None:
            print(f"⚠️  Could not load: {img_path}")
            continue

        embedding = recognizer.get_face_embedding(img)
        if embedding is None:
            print(f"⚠️  No face in: {img_path}")
            continue

        name, score = database.search(embedding, threshold=0.6)
        results.append(
            {"image": img_path, "name": name if name else "Unknown", "score": score}
        )

        print(f"{img_path}: {name if name else 'Unknown'} ({score:.4f})")

    # Summary
    recognized = sum(1 for r in results if r["name"] != "Unknown")
    print(f"\n📊 Summary: {recognized}/{len(results)} recognized")


def example_4_multiple_faces():
    """Example 4: Detect multiple faces in one image"""
    print("\n" + "=" * 60)
    print("EXAMPLE 4: Multiple Face Detection")
    print("=" * 60)

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)
    database = FaceDatabase("face_database.pkl")

    # Load image with multiple people
    image_path = "group_photo.jpg"
    img = cv2.imread(image_path)

    if img is None:
        print(f"Could not load image: {image_path}")
        return

    # Get all faces
    faces_data = recognizer.get_all_faces_embeddings(img)

    if not faces_data:
        print("No faces detected")
        return

    print(f"Found {len(faces_data)} face(s)\n")

    # Process each face
    for idx, (embedding, bbox) in enumerate(faces_data, 1):
        name, score = database.search(embedding, threshold=0.6)
        x1, y1, x2, y2 = bbox

        print(f"Face {idx}:")
        print(f"  Position: ({x1}, {y1}) to ({x2}, {y2})")
        print(f"  Identity: {name if name else 'Unknown'}")
        print(f"  Confidence: {score:.4f}\n")

        # Draw on image
        color = (0, 255, 0) if name else (0, 0, 255)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
        label = name if name else "Unknown"
        cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

    # Save annotated image
    output_path = "annotated_group_photo.jpg"
    cv2.imwrite(output_path, img)
    print(f"✅ Saved annotated image to: {output_path}")


def example_5_build_from_folder():
    """Example 5: Build database from folder"""
    print("\n" + "=" * 60)
    print("EXAMPLE 5: Build Database from Folder")
    print("=" * 60)

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)

    # Folder containing person subdirectories
    folder_path = "people_photos"

    # Load images from folder
    embeddings_dict = load_images_from_folder(folder_path, recognizer)

    # Create database
    database = FaceDatabase("new_database.pkl")

    # Add all embeddings
    total = 0
    for name, embeddings in embeddings_dict.items():
        for embedding in embeddings:
            database.add_person(name, embedding)
            total += 1

    # Save
    database.save_database()

    # Print statistics
    stats = database.get_statistics()
    print(f"\n✅ Database created successfully!")
    print(f"   Total people: {stats['total_people']}")
    print(f"   Total embeddings: {stats['total_embeddings']}")


def example_6_compare_two_faces():
    """Example 6: Compare two faces directly"""
    print("\n" + "=" * 60)
    print("EXAMPLE 6: Compare Two Faces")
    print("=" * 60)

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)

    # Load two images
    img1_path = "person1.jpg"
    img2_path = "person2.jpg"

    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)

    if img1 is None or img2 is None:
        print("Could not load images")
        return

    # Get embeddings
    embedding1 = recognizer.get_face_embedding(img1)
    embedding2 = recognizer.get_face_embedding(img2)

    if embedding1 is None or embedding2 is None:
        print("Could not detect faces in one or both images")
        return

    # Calculate similarity
    cosine_sim = FaceRecognizer.cosine_similarity(embedding1, embedding2)
    euclidean_dist = FaceRecognizer.euclidean_distance(embedding1, embedding2)

    print(f"Cosine Similarity: {cosine_sim:.4f}")
    print(f"Euclidean Distance: {euclidean_dist:.4f}")

    # Interpret results
    if cosine_sim > 0.6:
        print("\n✅ Same person (High confidence)")
    elif cosine_sim > 0.4:
        print("\n⚠️  Possibly same person (Medium confidence)")
    else:
        print("\n❌ Different people (Low confidence)")


def example_7_database_operations():
    """Example 7: Database operations"""
    print("\n" + "=" * 60)
    print("EXAMPLE 7: Database Operations")
    print("=" * 60)

    # Initialize database
    database = FaceDatabase("face_database.pkl")

    # Get statistics
    stats = database.get_statistics()
    print(f"\n📊 Database Statistics:")
    print(f"   Total people: {stats['total_people']}")
    print(f"   Total embeddings: {stats['total_embeddings']}")

    # List all people
    print(f"\n👥 People in database:")
    for name, count in stats["people"].items():
        print(f"   • {name}: {count} embeddings")

    # Get average embedding for a person
    if stats["total_people"] > 0:
        first_person = list(stats["people"].keys())[0]
        avg_embedding = database.get_average_embedding(first_person)
        print(f"\n📐 Average embedding for {first_person}:")
        print(f"   Shape: {avg_embedding.shape}")
        print(f"   First 5 values: {avg_embedding[:5]}")

    # Delete a person (example - uncomment to use)
    # person_to_delete = "John Doe"
    # if database.delete_person(person_to_delete):
    #     print(f"\n🗑️  Deleted {person_to_delete} from database")


def example_8_webcam_recognition():
    """Example 8: Real-time webcam recognition"""
    print("\n" + "=" * 60)
    print("EXAMPLE 8: Webcam Recognition")
    print("=" * 60)
    print("\nPress 'q' to quit\n")

    # Initialize
    recognizer = FaceRecognizer(use_gpu=False)
    database = FaceDatabase("face_database.pkl")

    # Open webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Could not open webcam")
        return

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Process every 10 frames (for performance)
        if frame_count % 10 == 0:
            # Get all faces
            faces_data = recognizer.get_all_faces_embeddings(frame)

            # Draw results
            for embedding, bbox in faces_data:
                name, score = database.search(embedding, threshold=0.6)
                x1, y1, x2, y2 = bbox

                # Draw bounding box
                color = (0, 255, 0) if name else (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # Draw label
                label = f"{name if name else 'Unknown'} ({score:.2f})"
                cv2.putText(
                    frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2
                )

        # Display frame
        cv2.imshow("Face Recognition", frame)

        # Check for quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

        frame_count += 1

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Webcam session ended")


def main():
    """Run examples"""
    print("\n" + "=" * 60)
    print("FACE RECOGNITION SYSTEM - EXAMPLES")
    print("=" * 60)

    print("\nAvailable examples:")
    print("1. Basic face recognition")
    print("2. Add new person to database")
    print("3. Batch recognition")
    print("4. Multiple face detection")
    print("5. Build database from folder")
    print("6. Compare two faces")
    print("7. Database operations")
    print("8. Webcam recognition")

    choice = input("\nEnter example number (1-8): ").strip()

    examples = {
        "1": example_1_basic_recognition,
        "2": example_2_add_new_person,
        "3": example_3_batch_recognition,
        "4": example_4_multiple_faces,
        "5": example_5_build_from_folder,
        "6": example_6_compare_two_faces,
        "7": example_7_database_operations,
        "8": example_8_webcam_recognition,
    }

    if choice in examples:
        examples[choice]()
    else:
        print("Invalid choice!")


if __name__ == "__main__":
    main()
