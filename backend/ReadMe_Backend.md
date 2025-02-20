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

### 1.2. Luồng xử lý
```mermaid
graph TD
    A[Client] --> B[/api/run-prompt]
    B --> C[PromptTestRunner]
    C --> D[OpenAI API]
    D --> E[Test Cases với Prompt Output]
    E --> F[/api/evaluate-results]
    F --> G[PromptEvaluator]
    G --> H[Kết quả đánh giá]
    H --> A
```

1. **Chạy Prompt**:
   - Client gửi prompt + test cases
   - PromptTestRunner xử lý từng test case
   - Gọi OpenAI API để lấy output
   - Trả về test cases đã có prompt_output

2. **Đánh giá Kết quả**:
   - Client gửi test cases đã có prompt_output
   - PromptEvaluator tính toán độ chính xác
   - So sánh với expected output
   - Trả về metrics đánh giá

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

## 4. Monitoring & Logging

### 4.1. Logging
- Sử dụng Python logging module
- Log được lưu trong container logs
- Format: `[Level] [Module] Message`

### 4.2. Metrics
- Accuracy: Tỷ lệ test cases đúng
- Similarity Score: Độ tương đồng output
- Response Time: Thời gian xử lý
- Total Time: Tổng thời gian request

## 5. Error Handling

### 5.1. Common Errors
- OpenAI API errors
- Invalid prompt format
- Test case validation errors

### 5.2. Error Response Format
```json
{
  "detail": "Error message"
}
```

## 6. Security
- CORS configuration
- API key validation
- Rate limiting (TODO)
- Input validation via Pydantic

## 7. Future Improvements
1. Caching mechanism
2. Batch processing
3. Advanced similarity metrics
4. Retry mechanism
5. Rate limiting
6. Performance optimization

Cần thêm thông tin gì không?
