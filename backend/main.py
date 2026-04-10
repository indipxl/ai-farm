import os, base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# ── Setup ─────────────────────────────────────────────────────────────────────

load_dotenv()

app = FastAPI()

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://gaia-sabah-c3-group2-aifarm.web.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini LLM ────────────────────────────────────────────────────────────────

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    api_key=os.getenv("GEMINI_API_KEY")
)

# ── Prompt (adapted from your reference for crop disease) ─────────────────────

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert agricultural scientist and plant pathologist specialising in crop disease and pest detection in Malaysian farms."),
    ("human", [
        {
            "type": "text",
            "text": """You are a crop disease and pest detection AI. Analyze the plant image provided and respond ONLY in this exact JSON format with no extra text or markdown:

{{
  "detection": "detected disease or pest name, or 'No Disease or Pest Detected'",
  "confidence": 91,
  "status": "danger | warning | healthy",
  "detail": "one sentence description of what you see in the image",
  "suggestions": [
    "action 1",
    "action 2",
    "action 3"
  ]
}}

Rules:
- confidence is a number between 0 and 100
- status is exactly one of: danger, warning, healthy
- suggestions must be an array of 3 practical farming actions
- Be specific to Malaysian tropical farming conditions
- If image is not a plant, return status: healthy with detection: 'Unable to analyse — please upload a clear plant photo'
""",
        },
        {
            "type": "image_url",
            "image_url": {
                "url": "data:image/jpeg;base64,{image}",
                "detail": "low",
            }
        }
    ])
])

chain = prompt | llm

# ── Helper ────────────────────────────────────────────────────────────────────

def encode_image(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode()

# ── Route ─────────────────────────────────────────────────────────────────────

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read and encode image
        image_bytes = await file.read()
        image_b64   = encode_image(image_bytes)

        # Run Gemini analysis
        response = chain.invoke({"image": image_b64})

        # Parse JSON from Gemini response
        import json, re
        raw = response.content.strip()

        # Strip markdown code fences if Gemini wraps in ```json ... ```
        raw = re.sub(r"```json|```", "", raw).strip()

        result = json.loads(raw)

        return {
            "success":    True,
            "detection":  result.get("detection",  "Unknown"),
            "confidence": result.get("confidence", 0),
            "status":     result.get("status",     "healthy"),
            "detail":     result.get("detail",     ""),
            "suggestions":result.get("suggestions",[]),
        }

    except Exception as e:
        return {
            "success":    False,
            "detection":  "Analysis Failed",
            "confidence": 0,
            "status":     "healthy",
            "detail":     f"Error: {str(e)}",
            "suggestions":["Please try again", "Ensure image is clear", "Check internet connection"],
        }


@app.get("/")
def root():
    return {"message": "Ai Farm — Crop Disease Detection API is running"}

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi import APIRouter
# import os
# from dotenv import load_dotenv
# import firebase_admin
# from firebase_admin import credentials, firestore
# import uvicorn

# app = FastAPI(title="Ai Farm API", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "https://gaia-sabah-c3-group2-aifarm.web.app"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# load_dotenv()
# project_id = os.getenv("FIREBASE_PROJECT_ID")
# service_account_path = "gaia-sabah-c3-group2-aifarm-02d42c9eeb6a.json"

# if os.path.exists(service_account_path):
#     # runs on your local/cloud shell
#     cred = credentials.Certificate(service_account_path)
#     firebase_admin.initialize_app(cred)
# else:
#     # runs on Cloud Run
#     firebase_admin.initialize_app()
# db = firestore.client()

# # batches
# from services.batches import router as batches_router
# app.include_router(batches_router, prefix="/api")

# # crops
# from services.crops import router as crops_router
# app.include_router(crops_router, prefix="/api")

# # sensors
# from services.sensor_data import router as sensors_router
# app.include_router(sensors_router, prefix="/api")

# # if __name__ == "__main__":
# #     port = int(os.getenv('PORT', 8080))
# #     uvicorn.run(app, host="0.0.0.0", port=port)
