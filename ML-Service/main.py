from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from starlette.middleware.cors import CORSMiddleware
from PIL import Image
import cv2
import numpy as np
import io
import uvicorn
from face_recognition import FaceRecognizer, FaceDatabase
from pathlib import Path
import os
from fastapi.responses import JSONResponse
import logging

app = FastAPI()

# Allow Spring Boot to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Load model and database once when server starts (not on every request)
recognizer = FaceRecognizer(use_gpu=False, model_name="ArcFace")
database = FaceDatabase(
    "face_database.pkl"
)  # Make sure this file is in the same folder

# Settings - change these if needed
THRESHOLD = 0.35
METRIC = "cosine"

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recognition_api")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/identify")
async def identify_person(image: UploadFile = File(...)):
    try:
        logger.info(
            "identify_person: received file name=%s content_type=%s",
            image.filename,
            image.content_type,
        )

        # Read uploaded image
        image_bytes = await image.read()
        logger.info("identify_person: bytes_received=%s", len(image_bytes))
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        logger.info(
            "identify_person: pil_image size=%s mode=%s", pil_image.size, pil_image.mode
        )

        # Convert PIL to OpenCV format (RGB -> BGR)
        image_np = np.array(pil_image)
        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        logger.info("identify_person: image_cv shape=%s", image_cv.shape)

        # Detect all faces and get their embeddings
        faces_data = recognizer.get_all_faces_embeddings(image_cv)
        logger.info("identify_person: faces_detected=%s", len(faces_data))

        # No face found
        if not faces_data:
            response = {
                "name": "Person Not Found",
                "confidence": 0.0,
                "status": "no_face_detected",
            }
            logger.info("identify_person: response=%s", response)
            return response

        # Search each face in database
        results = []
        for embedding, bbox in faces_data:
            matched_name, score = database.search(
                embedding, threshold=THRESHOLD, metric=METRIC
            )
            results.append(
                {
                    "name": matched_name if matched_name else "Unknown",
                    "confidence": round(score, 4),
                    "is_recognized": matched_name is not None,
                }
            )

        # If only one face, return simple response
        if len(results) == 1:
            result = results[0]
            if result["is_recognized"]:
                response = {
                    "name": result["name"],
                    "confidence": result["confidence"],
                    "status": "recognized",
                }
            else:
                response = {
                    "name": "Person Not Found",
                    "confidence": result["confidence"],
                    "status": "not_in_database",
                }
            logger.info("identify_person: response=%s", response)
            return response

        # If multiple faces, return all results
        recognized = [r for r in results if r["is_recognized"]]
        response = {
            "name": recognized[0]["name"] if recognized else "Person Not Found",
            "confidence": recognized[0]["confidence"] if recognized else 0.0,
            "status": "recognized" if recognized else "not_in_database",
            "total_faces": len(results),
            "all_results": results,
        }
        logger.info(
            "identify_person: response total_faces=%s recognized=%s",
            len(results),
            len(recognized),
        )
        return response

    except Exception as e:
        logger.exception("identify_person failed")
        return {"name": "Error", "confidence": 0.0, "status": str(e)}


@app.post("/add-person")
async def add_person(
    name: str = Form(..., description="Name of the person"),
    image: UploadFile = File(..., description="Face image of the person"),
):
    """
    Add a new person to the face database

    Parameters:
    - name: Name of the person (required)
    - image: Image file containing the person's face (required)

    Returns:
    - success: Boolean indicating if the operation was successful
    - message: Description of the result
    - person_name: Name of the person added
    - embeddings_count: Number of face embeddings generated
    """

    try:
        # Validate file type
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="Uploaded file must be an image"
            )

        # Read image
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Could not decode image. Please upload a valid image file.",
            )

        print(f"\n[INFO] Processing new person: {name}")
        print(f"[INFO] Image shape: {img.shape}")

        # Generate face embedding using the recognizer
        try:
            embedding = recognizer.get_face_embedding(img)

            if embedding is None:
                return JSONResponse(
                    status_code=400,
                    content={
                        "success": False,
                        "message": "No face detected in the image. Please upload a clear face image.",
                        "person_name": name,
                        "embeddings_count": 0,
                    },
                )

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error generating face embedding: {str(e)}"
            )

        # Add to database
        try:
            database.add_person(name, embedding)
            database.save_database()

            print(f"[SUCCESS] Added {name} to database")

            # Get updated statistics
            stats = database.get_statistics()
            person_embeddings = stats["people"].get(name, 0)

            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Successfully added {name} to the database",
                    "person_name": name,
                    "embeddings_count": person_embeddings,
                    "total_people": stats["total_people"],
                    "total_embeddings": stats["total_embeddings"],
                },
            )

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error saving to database: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/add-person-multiple")
async def add_person_multiple(
    name: str = Form(..., description="Name of the person"),
    images: list[UploadFile] = File(
        ..., description="Multiple face images of the person"
    ),
):
    """
    Add a new person with multiple images to the face database
    This improves recognition accuracy by creating multiple embeddings

    Parameters:
    - name: Name of the person (required)
    - images: Multiple image files containing the person's face (required)

    Returns:
    - success: Boolean indicating if the operation was successful
    - message: Description of the result
    - person_name: Name of the person added
    - embeddings_added: Number of face embeddings successfully generated
    - images_processed: Number of images processed
    - failed_images: Number of images that failed to process
    """

    try:
        embeddings_added = 0
        images_processed = 0
        failed_images = 0
        failed_reasons = []

        print(f"\n[INFO] Processing multiple images for: {name}")
        print(f"[INFO] Total images received: {len(images)}")

        for idx, image in enumerate(images, 1):
            try:
                # Validate file type
                if not image.content_type.startswith("image/"):
                    failed_images += 1
                    failed_reasons.append(f"Image {idx}: Not a valid image file")
                    continue

                # Read image
                contents = await image.read()
                nparr = np.frombuffer(contents, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is None:
                    failed_images += 1
                    failed_reasons.append(f"Image {idx}: Could not decode image")
                    continue

                # Generate face embedding
                embedding = recognizer.get_face_embedding(img)

                if embedding is None:
                    failed_images += 1
                    failed_reasons.append(f"Image {idx}: No face detected")
                    continue

                # Add to database
                database.add_person(name, embedding)
                embeddings_added += 1
                images_processed += 1

                print(f"[SUCCESS] Processed image {idx}/{len(images)}")

            except Exception as e:
                failed_images += 1
                failed_reasons.append(f"Image {idx}: {str(e)}")
                print(f"[ERROR] Failed to process image {idx}: {str(e)}")

        # Save database if any embeddings were added
        if embeddings_added > 0:
            database.save_database()
            print(f"[SUCCESS] Added {embeddings_added} embeddings for {name}")

        # Get updated statistics
        stats = database.get_statistics()
        person_total_embeddings = stats["people"].get(name, 0)

        # Prepare response
        response_data = {
            "success": embeddings_added > 0,
            "message": f"Processed {images_processed}/{len(images)} images successfully",
            "person_name": name,
            "embeddings_added": embeddings_added,
            "images_processed": images_processed,
            "failed_images": failed_images,
            "total_embeddings_for_person": person_total_embeddings,
            "total_people": stats["total_people"],
            "total_embeddings": stats["total_embeddings"],
        }

        if failed_reasons:
            response_data["failed_reasons"] = failed_reasons

        if embeddings_added == 0:
            response_data["message"] = (
                "Failed to process any images. No faces were detected."
            )
            return JSONResponse(status_code=400, content=response_data)

        return JSONResponse(status_code=200, content=response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get("/database-stats")
async def get_database_stats():
    """
    Get statistics about the face database

    Returns:
    - total_people: Total number of unique people in the database
    - total_embeddings: Total number of face embeddings stored
    - people: Dictionary with person names and their embedding counts
    """
    try:
        stats = database.get_statistics()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "total_people": stats["total_people"],
                "total_embeddings": stats["total_embeddings"],
                "people": stats["people"],
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving database statistics: {str(e)}"
        )


@app.delete("/delete-person/{name}")
async def delete_person(name: str):
    """
    Delete a person from the face database

    Parameters:
    - name: Name of the person to delete

    Returns:
    - success: Boolean indicating if the operation was successful
    - message: Description of the result
    """
    try:
        # Check if person exists
        stats = database.get_statistics()
        if name not in stats["people"]:
            return JSONResponse(
                status_code=404,
                content={
                    "success": False,
                    "message": f"Person '{name}' not found in database",
                },
            )

        embeddings_count = stats["people"][name]

        # Delete person from database
        # Note: You'll need to implement this method in FaceDatabase class
        database.delete_person(name)
        database.save_database()

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": f"Successfully deleted {name} from database",
                "embeddings_removed": embeddings_count,
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting person: {str(e)}")


# Run: python -m uvicorn main:app --reload
# API runs on: http://localhost:8000
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
