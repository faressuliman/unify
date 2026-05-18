from deepface import DeepFace
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

app = FastAPI()

# إعدادات الـ CORS عشان نسمح للـ React يكلم السيرفر من غير مشاكل
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# ----------------------------------------------------
# مسار استخراج بصمة الوجه (Face Encoding for Search)
# ----------------------------------------------------
@app.post('/get-face-encoding')
async def get_face_encoding(image: UploadFile = File(...)):
    try:
        # قراءة الصورة في الذاكرة (بدون إنشاء ملفات مؤقتة)
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_cv is None:
            return {"success": False, "error": "Invalid image file format."}

        # استخراج الـ Embedding (البصمة الرياضية للوجه)
        # استخدمنا Facenet512 لأنه الأقوى في حالات تغير السن (Aging)
        embeddings = DeepFace.represent(
            img_path=img_cv,
            model_name='Facenet512',
            detector_backend='retinaface', # أدق محرك للصور الصغيرة والبعيدة
            enforce_detection=True
        )

        # بصمة أول وجه يظهر في الصورة
        encoding = embeddings[0]["embedding"]

        return {
            "success": True,
            "encoding": encoding
        }

    except Exception as e:
        print(f"Encoding Error: {e}")
        return {"success": False, "error": str(e)}