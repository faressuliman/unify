from typing import Optional
from deepface import DeepFace
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import cv2
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI detection model once at startup (not on every request)
ai_detector = pipeline(
    "image-classification",
    model="umm-maybe/AI-image-detector"
)

# ----------------------------------------------------
# Face Encoding Endpoint
# ----------------------------------------------------
@app.post('/get-face-encoding')
async def get_face_encoding(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_cv is None:
            return {"success": False, "error": "Invalid image file format."}

        # Fix: convert BGR to RGB before passing to DeepFace
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)

        embeddings = DeepFace.represent(
            img_path=img_rgb,
            model_name='Facenet512',
            detector_backend='retinaface',
            enforce_detection=True
        )

        encoding = embeddings[0]["embedding"]

        return {
            "success": True,
            "encoding": encoding
        }

    except Exception as e:
        print(f"Encoding Error: {e}")
        return {"success": False, "error": str(e)}


# ----------------------------------------------------
# AI Image Detection Endpoint
# ----------------------------------------------------
@app.post('/detect-ai-image')
async def detect_ai_image(image: UploadFile = File(...), source: Optional[str] = Form(None)):
    try:
        contents = await image.read()

        # Convert to PIL Image (what the HuggingFace pipeline expects)
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = ai_detector(pil_image)

        # Results look like:
        # [{"label": "artificial", "score": 0.97}, {"label": "human", "score": 0.03}]
        top = results[0]
        label = top["label"]
        score = top["score"]

        # Dynamically set threshold based on source
        # create_post and search_filter get 50%, claim_family and registration (no source) get 80%
        threshold_value = 0.50 if source in ['create_post', 'search_filter'] else 0.80

        # Threshold check
        if label == "human" and score >= threshold_value:
            is_ai = False
            confidence = round(score * 100, 2)
            decision = "pass"
            final_label = "human"
        else:
            # It's either artificial or uncertain human
            is_ai = True
            decision = "block"
            final_label = "artificial"
            # Return the probability that it is NOT a verified human
            if label == "artificial":
                confidence = round(score * 100, 2)
            else:
                confidence = round((1 - score) * 100, 2)

        return {
            "success": True,
            "is_ai_generated": is_ai,
            "confidence": confidence,    # e.g. 97.43
            "label": final_label,        # "artificial" or "human"
            "decision": decision
        }

    except Exception as e:
        print(f"AI Detection Error: {e}")
        return {"success": False, "error": str(e)}