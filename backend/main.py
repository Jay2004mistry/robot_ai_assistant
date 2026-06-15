from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
import os
import sys
import asyncio
import edge_tts
import base64

# Ensure current working directory is in system path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import qa_engine
except ImportError:
    # If working directory path issue, try relative imports
    import sys
    sys.path.insert(0, os.getcwd())
    import qa_engine

from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
INDEX_FILE = STATIC_DIR / "index.html"

app = FastAPI(title="Vihil Robot AI Voice Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for cached TTS voices
_cached_voices = None

voice_map = {
    "en": "en-US-AriaNeural",
    "hi": "hi-IN-SwaraNeural",
    "gu": "gu-IN-DhwaniNeural",
    "es": "es-ES-ElviraNeural",
    "fr": "fr-FR-DeniseNeural",
    "de": "de-DE-KatjaNeural",
    "ja": "ja-JP-NanamiNeural",
    "zh": "zh-CN-XiaoxiaoNeural",
    "ar": "ar-SA-AminaNeural",
    "ru": "ru-RU-SvetlanaNeural",
    "pt": "pt-PT-RaquelNeural"
}

def classify_expression(text: str) -> str:
    text_lower = text.lower()
    
    # Happy triggers
    happy_words = ["hello", "hi ", "hey ", "welcome", "namaste", "kem chho", "kaise ho", "thank", "glad", "delighted", "great", "awesome", "perfect", "good", "happy", "joy"]
    if any(w in text_lower for w in happy_words):
        return "happy"
        
    # Sad/Error triggers
    sad_words = ["sorry", "unfortunately", "failed", "error", "limit", "rate limit", "cannot", "couldn't", "apologize", "offline"]
    if any(w in text_lower for w in sad_words):
        return "sad"
        
    # Surprised triggers (achievements, statistics)
    surprised_words = ["csat", "4.8", "100+", "50+", "60+", "86%", "94%", "achieve", "deliver", "impressive", "outstanding"]
    if any(w in text_lower for w in surprised_words):
        return "surprised"
        
    # Thinking/Technical triggers
    thinking_words = ["process", "research", "methodology", "next.js", "react", "fastapi", "python", "node", "typescript", "architecture", "sprint", "kanban", "method", "development"]
    if any(w in text_lower for w in thinking_words):
        return "thinking"
        
    # Concerned/Engagement triggers
    concerned_words = ["contact", "email", "phone", "nda", "security", "cyber", "audit", "compliance", "book a call", "google meet", "zoom"]
    if any(w in text_lower for w in concerned_words):
        return "concerned"
        
    return "neutral"

async def get_voice_for_lang(lang: str) -> str:
    global _cached_voices
    
    lang_prefix = lang.lower().split("-")[0]
    
    # 1. Check mapped presets
    if lang_prefix in voice_map:
        return voice_map[lang_prefix]
        
    # 2. Query edge-tts dynamically
    if not _cached_voices:
        try:
            _cached_voices = await edge_tts.list_voices()
        except Exception as err:
            print("Error listing edge-tts voices:", err)
            return "en-US-AriaNeural"
            
    # Search in edge-tts voices for a female voice matching the language prefix
    for v in _cached_voices:
        short_name = v["ShortName"].lower()
        if short_name.startswith(f"{lang_prefix}-") and v.get("Gender") == "Female":
            return v["ShortName"]
            
    # Search for any voice matching the language prefix
    for v in _cached_voices:
        short_name = v["ShortName"].lower()
        if short_name.startswith(f"{lang_prefix}-"):
            return v["ShortName"]
            
    return "en-US-AriaNeural"

async def generate_speech_b64(text: str, lang: str) -> str:
    try:
        voice_name = await get_voice_for_lang(lang)
        # edge-tts speed optimization
        comm = edge_tts.Communicate(text, voice=voice_name, rate="+15%")
        audio_data = b""
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return base64.b64encode(audio_data).decode("utf-8")
    except Exception as e:
        print(f"edge-tts synthesis failed: {e}")
        return ""

class QueryRequest(BaseModel):
    query: str
    lang: str = None
    voice_response: bool = False

@app.post("/api/query")
async def api_query(request: QueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        ans, lang_code = qa_engine.answer_query(request.query, lang_pref=request.lang)
        
        # Generate base64 audio response via edge-tts
        audio_b64 = None
        if request.voice_response:
            clean_text = ans.replace("*", "").replace("#", "").replace("_", "")
            audio_b64 = await generate_speech_b64(clean_text, lang_code)
            
        explicit_switch = qa_engine.check_language_switch_request(request.query) is not None
        return {"answer": ans, "audio": audio_b64, "lang": lang_code, "explicit_switch": explicit_switch}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VoiceQueryRequest(BaseModel):
    query: str
    lang: str = "en"

@app.post("/api/voice-query")
async def api_voice_query(request: VoiceQueryRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        # 1. Coordinate query using the chatbot's official RAG/Groq qa_engine.py
        ans, detected_lang = qa_engine.answer_query(request.query, filepath="knowledge_base.json", lang_pref=request.lang)
        
        # 2. Dynamically classify the robot expression state
        expression = classify_expression(ans)
        
        # 3. Clean markdown formatting for clean vocal speech output
        clean_speech = ans.replace("*", "").replace("#", "").replace("_", "")
        
        # 4. Generate base64 audio response via edge-tts
        audio_b64 = await generate_speech_b64(clean_speech, detected_lang)
        
        return {
            "text": ans,
            "audio": audio_b64,
            "expression": expression
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TtsRequest(BaseModel):
    text: str
    lang: str = "en"

@app.post("/api/tts")
async def api_tts(request: TtsRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required.")
    audio_b64 = await generate_speech_b64(request.text, request.lang)
    return {"audio": audio_b64}

@app.get("/api/data")
def api_data():
    try:
        kb = qa_engine.load_knowledge_base("knowledge_base.json")
        return kb
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_index():
    if not INDEX_FILE.exists():
        raise HTTPException(status_code=500, detail="static/index.html is missing.")
    return FileResponse(INDEX_FILE)

STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if __name__ == "__main__":
    import uvicorn
    # Check port setting from environment or default to 8001
    port = int(os.environ.get("PORT", 8001))
    print(f"Launching Vihil InfoTech AI Assistant on http://127.0.0.1:{port}")
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
