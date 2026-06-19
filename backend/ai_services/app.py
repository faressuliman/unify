import os
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
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

_ai_detector = None
_face_model = None

def get_ai_detector():
    global _ai_detector
    if _ai_detector is None:
        from transformers import pipeline
        _ai_detector = pipeline(
            "image-classification",
            model="umm-maybe/AI-image-detector"
        )
    return _ai_detector

def get_face_model():
    global _face_model
    if _face_model is None:
        from deepface import DeepFace
        _face_model = DeepFace
    return _face_model

# ----------------------------------------------------
# Face Encoding Endpoint
# ----------------------------------------------------
@app.post('/get-face-encoding')
async def get_face_encoding(image: UploadFile = File(...)):
    try:
        import cv2
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_cv is None:
            return {"success": False, "error": "Invalid image file format."}
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        DeepFace = get_face_model()
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
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        ai_detector = get_ai_detector()
        results = ai_detector(pil_image)
        top = results[0]
        label = top["label"]
        score = top["score"]
        threshold_value = 0.80
        if label == "human" and score >= threshold_value:
            is_ai = False
            confidence = round(score * 100, 2)
            decision = "pass"
            final_label = "human"
        else:
            is_ai = True
            decision = "block"
            final_label = "artificial"
            if label == "artificial":
                confidence = round(score * 100, 2)
            else:
                confidence = round((1 - score) * 100, 2)
        return {
            "success": True,
            "is_ai_generated": is_ai,
            "confidence": confidence,
            "label": final_label,
            "decision": decision
        }
    except Exception as e:
        print(f"AI Detection Error: {e}")
        return {"success": False, "error": str(e)}

# ----------------------------------------------------
# Warmup Endpoint
# ----------------------------------------------------
@app.get('/warmup')
async def warmup():
    return {"status": "warm"}