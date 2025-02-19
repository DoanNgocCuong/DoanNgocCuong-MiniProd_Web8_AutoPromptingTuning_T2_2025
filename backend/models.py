from pydantic import BaseModel
from typing import List, Optional

class Sample(BaseModel):
    input: str
    output: str

class TestCase(BaseModel):
    input: str
    expected_output: str
    actual_output: str
    is_correct: bool
    similarity_score: float

class OptimizationHistory(BaseModel):
    iteration: int
    accuracy: float
    response_time: float

class PromptRequest(BaseModel):
    format: str
    samples: List[Sample]
    conditions: Optional[str] = None
    iteration: int = 0

class PromptResponse(BaseModel):
    generated_prompt: str
    test_cases: List[TestCase]
    accuracy: float
    response_time: float
    iteration: int
    optimization_history: List[OptimizationHistory]

class FeedbackRequest(BaseModel):
    prompt: str
    feedback: str 