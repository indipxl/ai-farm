from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
import os
from google import genai
import json

router = APIRouter(prefix="/disease", tags=["disease"])
db = firestore.client()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_ID = "gemini-2.5-flash-lite"

LOCATION_SENSOR_MAP = {
    f"BLOCK {block}{num}": f"sensor_{block.lower()}{num}_data"
    for block in ["A", "B", "C", "D"]
    for num in range(1, 7)
}

@router.get("/map-data")
async def get_disease_map_data():
    try:
        docs = db.collection('batches').stream()
        farm_state = []
        has_danger = False

        for doc in docs:
            data = doc.to_dict()
            location = data.get('location', '')
            if not location:
                continue
            location_key = location.strip().upper()
            
            sensor_collection = LOCATION_SENSOR_MAP.get(location_key, 'sensor_data')
            latest_sensor_data = None
            sensor_docs = db.collection(sensor_collection).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(1).stream()
            for sdoc in sensor_docs:
                latest_sensor_data = sdoc.to_dict()
                # avoid datetimes throwing json serialization errors by not including certain fields or casting them
                if latest_sensor_data and 'timestamp' in latest_sensor_data:
                    latest_sensor_data['timestamp'] = latest_sensor_data['timestamp'].isoformat()

            latest_ai_report = None
            latest_soil_classification = None
            report_docs = db.collection('ai_reports').where('sensor_snapshot.batch_id', '==', doc.id).stream()
            
            latest_report_data = None
            latest_ts = None
            for rdoc in report_docs:
                rdata = rdoc.to_dict()
                ts = rdata.get('timestamp')
                if ts and (not latest_ts or ts > latest_ts):
                    latest_ts = ts
                    latest_report_data = rdata

            if latest_report_data:
                latest_ai_report = latest_report_data.get('ai_recommendation') or latest_report_data.get('analysis')
                latest_soil_classification = latest_report_data.get('soil_classification')
            
            status = 'healthy'
            if latest_soil_classification:
                cls_lower = latest_soil_classification.lower()
                if 'critical' in cls_lower:
                    status = 'danger'
                    has_danger = True
                elif 'warning' in cls_lower:
                    status = 'warning'

            farm_state.append({
                "block": location_key,
                "crop": data.get('crop', ''),
                "status": status,
                "sensor_data": latest_sensor_data,
                "recent_ai_report": latest_ai_report
            })
        
        prompt = f"""
        You are an expert AI Agronomist and Epidemiologist.
        You have the following real-time data for a farm's batches mapped to a grid layout:
        {json.dumps(farm_state, default=str)}
        
        The farm is laid out in a grid where blocks A1, A2, B1, etc. are adjacent based on standard grid topology.
        
        Task:
        Analyze the farm state. If there are active threats (e.g. status='danger' or 'warning', or mentions of diseases/pests in reports), trace their potential spread path to adjacent blocks considering their environmental sensor data. 
        If there are no threats, indicate that everything is safe.
        
        Output MUST be in strictly valid JSON format with the following keys:
        - active_threats (boolean)
        - threat_log (list of strings, summarizing the threats)
        - spread_prediction (string, your forecast text combining topography and environmental factors)
        - at_risk_blocks (list of strings, e.g. ["BLOCK A2", "BLOCK B1"])
        - preventative_actions (list of strings, actionable steps to halt the spread)
        
        DO NOT include markdown syntax (like ```json), just the raw JSON object.
        """

        response = client.models.generate_content(
            model=MODEL_ID, 
            contents=prompt
        )
        
        # Clean response
        res_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(res_text)
        
        # Add farm state to result
        result['farm_state'] = farm_state
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
