import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import easyocr
from deep_translator import GoogleTranslator
from flask import Flask, request, jsonify
from deepface import DeepFace

app = FastAPI()

# إعدادات الـ CORS عشان نسمح للـ React يكلم السيرفر من غير مشاكل
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# بنحمل موديل الـ OCR للغتين العربي والإنجليزي (بيتحمل مرة واحدة بس والسيرفر بيقوم)
reader = easyocr.Reader(['ar', 'en'])

# ----------------------------------------------------
# 1. مسار مطابقة الوجه (Face Verification)
# ----------------------------------------------------
@app.post('/verify-face')
async def verify_face(idPicture: UploadFile = File(...), selfiePicture: UploadFile = File(...)):
    id_path = f"temp_{idPicture.filename}"
    selfie_path = f"temp_{selfiePicture.filename}"
    
    try:
        # حفظ الصور مؤقتاً
        with open(id_path, "wb") as buffer:
            shutil.copyfileobj(idPicture.file, buffer)
        with open(selfie_path, "wb") as buffer:
            shutil.copyfileobj(selfiePicture.file, buffer)

        # المطابقة باستخدام DeepFace
        result = DeepFace.verify(
            img1_path=id_path,
            img2_path=selfie_path,
            enforce_detection=False
        )
        
        return {
            'verified': bool(result['verified']),
            'distance': float(result['distance'])
        }
        
    finally:
        # مسح الصور المؤقتة عشان منزحمش مساحة السيرفر
        if os.path.exists(id_path): os.remove(id_path)
        if os.path.exists(selfie_path): os.remove(selfie_path)

# ----------------------------------------------------
# 2. مسار قراءة بيانات البطاقة (ID Extraction & Validation)
# ----------------------------------------------------
@app.post('/extract-id-data')
async def extract_id_data(
    idPicture: UploadFile = File(...),
    enteredName: str = Form(...), 
    enteredYear: str = Form(...)  
):
    id_path = f"temp_ocr_{idPicture.filename}"
    
    try:
        with open(id_path, "wb") as buffer:
            shutil.copyfileobj(idPicture.file, buffer)
            
        result = reader.readtext(id_path, detail=0)
        full_text = " ".join(result).lower()
        
        # --- الجزء الخاص بالترجمة والمطابقة ---
        enteredName_lower = enteredName.lower().strip()
        
        # ترجمة الاسم للعربي
        arabic_name = ""
        try:
            arabic_name = GoogleTranslator(source='auto', target='ar').translate(enteredName)
        except Exception as e:
            print(f"Translation Error: {e}")
            arabic_name = enteredName

        # طباعة البيانات في الـ Terminal عشان نراقبها
        print(f"--- Debugging OCR ---")
        print(f"Extracted Text from ID: {full_text}")
        print(f"Entered Name (EN): {enteredName_lower}")
        print(f"Translated Name (AR): {arabic_name}")
        print(f"---------------------")

        # تحسين المطابقة: بنشيك على الاسم ككلمات منفصلة (بسيطة)
        # لأن أحياناً البطاقة بيكون فيها الاسم رباعي واليوزر بيكتب ثنائي
        name_parts = enteredName_lower.split()
        arabic_parts = arabic_name.split()

        # لو أي جزء من الاسم موجود في النص المستخرج، هنعتبرها مطابقة مبدئية
        name_match = any(part in full_text for part in name_parts) or \
                     any(part in full_text for part in arabic_parts)
        
        year_match = enteredYear.strip() in full_text
        
        return {
            'success': True,
            'is_name_match': name_match,
            'is_year_match': year_match,
            'extracted_text': full_text,
            'translated_name': arabic_name
        }
        
    except Exception as e:
        print(f"General Error: {e}")
        return {'success': False, 'error': str(e)}
        
    finally:
        if os.path.exists(id_path):
            os.remove(id_path)
            # ----------------------------------------------------
# 3. مسار استخراج بصمة الوجه (Face Encoding for Search)
# ----------------------------------------------------
@app.post('/get-face-encoding')
async def get_face_encoding(image: UploadFile = File(...)):
    temp_path = f"search_{image.filename}"
    
    try:
        # حفظ الصورة مؤقتاً للتحليل
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # استخراج الـ Embedding (البصمة الرياضية للوجه)
        # استخدمنا Facenet512 لأنه الأقوى في حالات تغير السن (Aging)
        embeddings = DeepFace.represent(
            img_path=temp_path,
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

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)