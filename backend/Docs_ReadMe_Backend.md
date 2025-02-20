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


## 2. Tài liệu API - http://103.253.20.13:25043/docs#/


### 2.1 POST /api/generate-prompt-and-testcases
/api/generate-prompt-and-testcases
Generate Prompt And Test Endpoint
```bash
curl -X 'POST' \
  'http://103.253.20.13:25043/api/generate-prompt-and-testcases' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "format": "string",
  "samples": [
    {
      "input": "string",
      "output": "string"
    }
  ],
  "conditions": "string",
  "num_test_cases": 5
}'
```

Response
```bash
{
  "prompt": "**Prompt:**\n\nYou are a string manipulation expert. Given a string as input, perform the following operations to produce the output:\n\n1. Convert the entire string to uppercase.\n2. Reverse the string.\n3. Replace all vowels (a, e, i, o, u) with the asterisk symbol (*).\n\n**You are trained on data up to October 2023.**\n\n**Sample Input-Output:**\n\n- Input: \"hello world\"\n- Output: \"DL*RW *L*H\"\n\n**Response Format:**\n- Output: string\n\n**Number of Test Cases Required: 1** \n\n---\n\nFeel free to provide the input string for processing!",
  "test_cases": [
    {
      "input": "\"Hello, world!\"",
      "expected_output": "\"Hello, world!\"",
      "prompt_output": "",
      "is_correct": false,
      "similarity_score": 0.7
    },
    {
      "input": "\"12345\"",
      "expected_output": "\"12345\"",
      "prompt_output": "",
      "is_correct": false,
      "similarity_score": 0.7
    },
    {
      "input": "\"   \"",
      "expected_output": "\"Error",
      "prompt_output": "",
      "is_correct": false,
      "similarity_score": 0.7
    },
    {
      "input": "\"A very long string that exceeds the maximum allowed length of characters in this prompt.\"",
      "expected_output": "\"Error",
      "prompt_output": "",
      "is_correct": false,
      "similarity_score": 0.7
    }
  ],
  "total_time": 4.439431667327881
}
```




### 2.2. POST /api/run-prompt
```http
POST /api/run-prompt
```

**Request Body**:
```json
curl -X 'POST' \
  'http://103.253.20.13:25043/api/run-prompt' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "prompt": "Bạn là một chuyên gia đánh giá phát âm. Hãy đánh giá phát âm của người dùng theo thang điểm: Phát âm chuẩn/Phát âm không chuẩn.",
  "test_cases": [
    {
      "expected_output": "Phát âm chuẩn",
      "input": "Đánh giá phát âm: '\''hello'\''",
      "is_correct": false,
      "prompt_output": "",
      "similarity_score": 0
    },
    {
      "expected_output": "Phát âm không chuẩn",
      "input": "Đánh giá phát âm: '\''world'\''",
      "is_correct": false,
      "prompt_output": "",
      "similarity_score": 0
    }
  ]
}'
```

**Response**:
```json
{
  "test_cases": [
    {
      "input": "Đánh giá phát âm: 'hello'",
      "expected_output": "Phát âm chuẩn",
      "prompt_output": {
        "input": "Đánh giá phát âm: 'hello'",
        "output": "Phát âm của từ \"hello\" được đánh giá là phát âm chuẩn.",
        "response_time": 0.9693231582641602
      },
      "is_correct": false,
      "similarity_score": 0
    },
    {
      "input": "Đánh giá phát âm: 'world'",
      "expected_output": "Phát âm không chuẩn",
      "prompt_output": {
        "input": "Đánh giá phát âm: 'world'",
        "output": "Phát âm của từ \"world\" thường được đánh giá là chuẩn nếu người nói phát âm rõ ràng, với âm \"w\" ở đầu, âm \"or\" được phát âm như trong từ \"word\", và âm \"ld\" ở cuối được phát âm một cách mượt mà. Nếu có sự nhầm lẫn trong âm \"or\" hoặc không phát âm rõ âm \"ld\", thì có thể coi là phát âm không chuẩn. \n\nTóm lại, nếu bạn phát âm \"world\" một cách rõ ràng và chính xác, thì đó là phát âm chuẩn. Nếu không, thì sẽ là phát âm không chuẩn.",
        "response_time": 2.662405252456665
      },
      "is_correct": false,
      "similarity_score": 0
    }
  ],
  "total_time": 3.632262945175171
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
