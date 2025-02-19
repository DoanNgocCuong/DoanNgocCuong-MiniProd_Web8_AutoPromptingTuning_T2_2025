from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Sample(BaseModel):
    input: str
    output: str

class PromptRequest(BaseModel):
    format: str
    samples: List[Sample]
    conditions: Optional[str] = None

class TestCase(BaseModel):
    input: str
    expected_output: str
    actual_output: str
    is_correct: bool

class PromptResponse(BaseModel):
    generated_prompt: str
    test_cases: List[TestCase]
    accuracy: float

@app.post("/api/generate-prompt", response_model=PromptResponse)
async def generate_prompt(request: PromptRequest):
    try:
        # Generate initial prompt based on format and samples
        prompt = generate_initial_prompt(request)
        
        # Generate test cases
        test_cases = generate_test_cases(request.samples)
        
        # Evaluate prompt
        accuracy = evaluate_prompt(prompt, test_cases)
        
        return PromptResponse(
            generated_prompt=prompt,
            test_cases=test_cases,
            accuracy=accuracy
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_initial_prompt(request: PromptRequest) -> str:
    # TODO: Implement prompt generation logic
    return f"""
You are an AI assistant that helps with {request.format}
Given input examples:
{format_samples(request.samples)}
Additional conditions:
{request.conditions}
    """

def generate_test_cases(samples: List[Sample]) -> List[TestCase]:
    # TODO: Implement test case generation
    test_cases = []
    for sample in samples:
        test_cases.append(
            TestCase(
                input=sample.input,
                expected_output=sample.output,
                actual_output="",  # Will be filled during evaluation
                is_correct=False
            )
        )
    return test_cases

def evaluate_prompt(prompt: str, test_cases: List[TestCase]) -> float:
    # TODO: Implement evaluation logic
    correct_count = 0
    total_count = len(test_cases)
    
    # Simulate evaluation
    for test_case in test_cases:
        test_case.is_correct = True  # Placeholder
        correct_count += 1
        
    return correct_count / total_count if total_count > 0 else 0

def format_samples(samples: List[Sample]) -> str:
    return "\n".join([f"Input: {s.input}\nOutput: {s.output}" for s in samples])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=25043) 