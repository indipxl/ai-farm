from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/crop-customization", tags=["Crop Customization"])

class CustomizationPrompt(BaseModel):
    crop_name: str
    prompt: str

class CustomizationResponse(BaseModel):
    isValid: bool
    isPossible: bool
    feedbackMessage: str
    recommendedRanges: Optional[Dict[str, str]] = None

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

CUSTOMIZATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a Strict Agricultural AI Expert specializing in Crop Customization. 
You must evaluate the farmer's request according to these exact rules:
1. If the prompt has nothing to do with crops, farming, or plant customization, return exactly:
   {{"isValid": false, "isPossible": false, "feedbackMessage": "This function is only for crop customization and nothing else.", "recommendedRanges": null}}
2. If the prompt is absurd, illogical, or impossible (e.g. growing chilli in 5 minutes, turning apples to chocolate), return exactly:
   {{"isValid": true, "isPossible": false, "feedbackMessage": "It is impossible to be done.", "recommendedRanges": null}}
3. If the prompt is valid and possible, provide the recommended target ranges limited STRICTLY to soil temperature, soil moisture, soil EC, and soil NPK. Also include a brief explanation of risks (like disease/pests) due to this customization in the feedbackMessage. 
   Return exactly this JSON structure:
   {{"isValid": true, "isPossible": true, "feedbackMessage": "Brief risk explanation...", "recommendedRanges": {{"soilTemperature": "min-max °C", "soilMoisture": "min-max %", "soilEC": "min-max mS/cm", "soilNPK": "N: min-max, P: min-max, K: min-max mg/kg"}} }}
   
Respond ONLY in valid JSON format with no additional text."""),
    ("human", "Crop: {crop_name}. Customization Goal: '{prompt}'")
])

customization_chain = CUSTOMIZATION_PROMPT | llm

@router.post("/generate", response_model=CustomizationResponse)
async def generate_customization(request: CustomizationPrompt):
    try:
        response = customization_chain.invoke({
            "crop_name": request.crop_name,
            "prompt": request.prompt
        })
        raw = re.sub(r"```json|```", "", response.content).strip()
        data = json.loads(raw)
        return CustomizationResponse(**data)
    except Exception as e:
        print(f"Error AI Customization: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI customization")
