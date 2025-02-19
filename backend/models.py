from pydantic import BaseModel
from typing import List, Optional

class Sample(BaseModel):
    input: str
    output: str

class PromptTestCase(BaseModel):
    input: str  # Input test case
    expected_output: str  # Output mong đợi
    prompt_output: str = ""  # Output từ prompt cần đánh giá
    is_correct: bool = False  # Kết quả so sánh
    similarity_score: float = 0.0  # Độ tương đồng

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
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Bạn là một chuyên gia đánh giá phát âm. Hãy đánh giá phát âm của người dùng theo thang điểm: Phát âm chuẩn/Phát âm không chuẩn.",
                "test_cases": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "",
                        "is_correct": False,
                        "similarity_score": 0.0
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn", 
                        "prompt_output": "",
                        "is_correct": False,
                        "similarity_score": 0.0
                    }
                ]
            }
        }

class EvaluationResponse(BaseModel):
    accuracy: float
    response_time: float  
    total_time: float
    test_results: List[PromptTestCase]

    class Config:
        json_schema_extra = {
            "example": {
                "accuracy": 0.75,
                "response_time": 245.5,
                "total_time": 982.0,
                "test_results": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "Phát âm chuẩn",
                        "is_correct": True,
                        "similarity_score": 1.0
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn",
                        "prompt_output": "Phát âm không chuẩn",
                        "is_correct": True, 
                        "similarity_score": 1.0
                    }
                ]
            }
        }

class RunPromptRequest(BaseModel):
    prompt: str
    test_cases: List[PromptTestCase]
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Bạn là một chuyên gia đánh giá phát âm. Hãy đánh giá phát âm của người dùng theo thang điểm: Phát âm chuẩn/Phát âm không chuẩn.",
                "test_cases": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "",
                        "is_correct": False,
                        "similarity_score": 0.0
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn",
                        "prompt_output": "",
                        "is_correct": False,
                        "similarity_score": 0.0
                    }
                ]
            }
        }

class RunPromptResponse(BaseModel):
    test_cases: List[PromptTestCase]
    total_time: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "test_cases": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "Phát âm chuẩn",  # Đã có output từ prompt
                        "is_correct": False,  # Chưa đánh giá
                        "similarity_score": 0.0  # Chưa tính similarity
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn",
                        "prompt_output": "Phát âm không chuẩn",  # Đã có output
                        "is_correct": False,
                        "similarity_score": 0.0
                    }
                ],
                "total_time": 1.234
            }
        }

class EvaluatePromptRequest(BaseModel):
    test_cases: List[PromptTestCase]  # Test cases đã có prompt_output
    
    class Config:
        json_schema_extra = {
            "example": {
                "test_cases": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "Phát âm chuẩn",  # Output từ API run-prompt
                        "is_correct": False,
                        "similarity_score": 0.0
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn",
                        "prompt_output": "Phát âm không chuẩn",
                        "is_correct": False,
                        "similarity_score": 0.0
                    }
                ]
            }
        }

class EvaluatePromptResponse(BaseModel):
    accuracy: float
    avg_similarity: float
    test_cases: List[PromptTestCase]
    
    class Config:
        json_schema_extra = {
            "example": {
                "accuracy": 1.0,  # 100% correct
                "avg_similarity": 1.0,  # Perfect similarity
                "test_cases": [
                    {
                        "input": "Đánh giá phát âm: 'hello'",
                        "expected_output": "Phát âm chuẩn",
                        "prompt_output": "Phát âm chuẩn",
                        "is_correct": True,  # Đã đánh giá
                        "similarity_score": 1.0  # Đã tính similarity
                    },
                    {
                        "input": "Đánh giá phát âm: 'world'",
                        "expected_output": "Phát âm không chuẩn",
                        "prompt_output": "Phát âm không chuẩn",
                        "is_correct": True,
                        "similarity_score": 1.0
                    }
                ]
            }
        }

class PromptInput(BaseModel):
    prompt: str
    input_text: str

class PromptOutput(BaseModel):
    input: str
    output: str
    response_time: float = 0.0

class EvaluationResult(BaseModel):
    accuracy: float
    avg_similarity: float
    test_cases: List[PromptTestCase] 