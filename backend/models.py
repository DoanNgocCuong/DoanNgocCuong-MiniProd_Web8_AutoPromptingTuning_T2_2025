from pydantic import BaseModel
from typing import List, Optional

class Sample(BaseModel):
    input: str
    output: str

class PromptTestCase(BaseModel):
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
    test_cases: List[PromptTestCase]
    accuracy: float
    response_time: float
    iteration: int
    optimization_history: List[OptimizationHistory]

class FeedbackRequest(BaseModel):
    prompt: str
    feedback: str

class TestCaseRequest(BaseModel):
    format: str
    samples: List[Sample]
    conditions: str
    num_cases: int = 5

class TestCaseResponse(BaseModel):
    test_cases: List[PromptTestCase]
    total_cases: int
    generation_time: float

class PromptAndTestRequest(BaseModel):
    format: str
    samples: List[Sample]
    conditions: Optional[str] = None
    num_test_cases: int = 5

class PromptAndTestResponse(BaseModel):
    prompt: str
    test_cases: List[PromptTestCase]
    total_time: float

class EvaluationRequest(BaseModel):
    prompt: str
    test_cases: List[PromptTestCase]

class EvaluationResponse(BaseModel):
    accuracy: float
    response_time: float
    total_time: float
    test_results: List[PromptTestCase] 