Tôi sẽ viết tài liệu chi tiết cho hệ thống:

# Tài liệu Hệ thống Auto-Prompting

## 1. Kiến trúc Backend

### 1.1. Cấu trúc thư mục
```
backend/
├── main.py              # FastAPI endpoints
├── models.py            # Pydantic models
├── run_prompt.py        # Core prompt runner
├── run_prompt_with_testcases.py  # Test case runner
├── run_prompt_evaluate.py        # Evaluator
├── test_case_generator.py        # Test case generation
├── utils.py             # Utility functions
└── requirements.txt     # Dependencies
```

### 1.2. Luồng xử lý dự kiến 
1. Gen Prompt và Test cases (dựa vào: Format JSON + Samples Input Output + Conditions Promp)

2. Chạy Prompt và Test cases (dựa vào: Prompt + Test cases)

3. Đánh giá Kết quả (Prompt so sánh output_prompt vs Expected_output từ Test Cases). 

---


## 2. Tài liệu API

### 2.1. Run Prompt API
```http
POST /api/run-prompt
```

**Request Body**:
```json
{
  "prompt": "Bạn là một chuyên gia đánh giá phát âm...",
  "test_cases": [
    {
      "input": "Đánh giá phát âm: 'hello'",
      "expected_output": "Phát âm chuẩn",
      "prompt_output": "",
      "is_correct": false,
      "similarity_score": 0.0
    }
  ]
}
```

**Response**:
```json
{
  "test_cases": [
    {
      "input": "Đánh giá phát âm: 'hello'",
      "expected_output": "Phát âm chuẩn",
      "prompt_output": "Phát âm chuẩn",
      "is_correct": false,
      "similarity_score": 0.0
    }
  ],
  "total_time": 1.234
}
```

### 2.2. Evaluate Results API
```http
POST /api/evaluate-results
```

**Request Body**:
```json
{
  "test_cases": [
    {
      "input": "Đánh giá phát âm: 'hello'",
      "expected_output": "Phát âm chuẩn",
      "prompt_output": "Phát âm chuẩn",
      "is_correct": false,
      "similarity_score": 0.0
    }
  ]
}
```

**Response**:
```json
{
  "accuracy": 1.0,
  "avg_similarity": 1.0,
  "test_cases": [
    {
      "input": "Đánh giá phát âm: 'hello'",
      "expected_output": "Phát âm chuẩn", 
      "prompt_output": "Phát âm chuẩn",
      "is_correct": true,
      "similarity_score": 1.0
    }
  ]
}
```

## 3. Deployment

### 3.1. Requirements
- Python 3.11+
- Docker
- OpenAI API key

### 3.2. Environment Variables
```env
OPENAI_API_KEY=your-api-key
PORT=25043
```

### 3.3. Build & Run
```bash
# Build Docker image
./deploy.sh --port 25043

# Check logs
docker logs auto-prompting-backend
```
