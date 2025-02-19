import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to Python path
backend_path = str(Path(__file__).parent.parent.absolute())
sys.path.insert(0, backend_path)

from main import app
from models import Sample

client = TestClient(app)

def test_generate_prompt_endpoint():
    request_data = {
        "format": "Input: {input} -> Output: {output}",
        "samples": [
            {"input": "hello", "output": "world"},
            {"input": "test", "output": "case"}
        ],
        "conditions": "Keep responses short",
        "iteration": 0
    }
    
    response = client.post("/api/generate-prompt", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "generated_prompt" in data
    assert "test_cases" in data
    assert "accuracy" in data
    assert "response_time" in data
    assert "iteration" in data
    assert "optimization_history" in data

def test_feedback_endpoint():
    request_data = {
        "prompt": "Test prompt",
        "feedback": "This is test feedback"
    }
    
    response = client.post("/api/feedback", json=request_data)
    
    assert response.status_code == 200
    assert response.json()["message"] == "Feedback received successfully" 