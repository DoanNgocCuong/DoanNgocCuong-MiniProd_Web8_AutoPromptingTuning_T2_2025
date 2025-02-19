# MiniProd_Web8_AutoPromptingTuning_T2-2025

## Project Overview

Auto Prompting Tool for IELTS and The Coach App that optimizes prompt generation through automated testing and tuning.

### 1. Objectives
- Create an automated prompt generation tool with ~90% accuracy
- Enable IELTS team to create prompts without prompting engineering expertise

### 2. Technical Architecture

#### Backend (Python FastAPI)
- Port: 25043
- Key Features:
  - Prompt generation engine
  - Automated test case generation (20-50 cases)
  - Evaluation system
  - Optimization loop

#### Frontend (Bun + React)
- Port: 25044
- Features:
  - Prompt input interface
  - Sample management
  - Test case visualization
  - Real-time accuracy metrics

### 3. Core Components

1. Prompt Generation System
```python
# Core structure
class PromptRequest:
    format: str
    samples: List[Sample]
    conditions: str

class Sample:
    input: str
    output: str
```

2. Evaluation System
- Accuracy metrics
- Response time tracking
- Automated optimization loop

3. User Interface
- Sample input/output management
- Test case monitoring
- Manual intervention options

### 4. Development Timeline
- Estimate: 16 hours
- Demo: Wednesday afternoon
- Project completion: Thursday afternoon

### 5. Deployment
```yaml
# docker-compose.yml structure
services:
  backend:
    build: ./backend
    ports:
      - "25043:25043"
    volumes:
      - ./backend:/app
    environment:
      - DEV_MODE=true

  frontend:
    build: ./frontend
    ports:
      - "25044:25044"
    volumes:
      - ./frontend:/app
```

### 6. Development URLs
- Backend: http://103.253.20.13:25043/
- Frontend: http://103.253.20.13:25044

### 7. Resources
- Leveraging existing APO/APE research
- Potential collaboration with team members

### 8. Next Steps
1. Set up development environment
2. Implement core prompt generation
3. Build test case generation system
4. Create evaluation metrics
5. Develop frontend interface
6. Integration and testing

1. Mục đích: 
- Đóng gói 1 task bị lặp lại đã từ rất lâu (6 tháng mình thực tập). 

- Sheet order Prompting được đóng gói trước đó: https://docs.google.com/spreadsheets/d/18eOvC4w3PfDjMg2tX1TqgpvorljPUYgklF49HRpUvVI/edit?gid=472456718#gid=472456718

- 
1. Hiểu Prompt làm gì? Input - Output? JSON ???	Summary AI's task	"2. Base Prompt (từ format Prompt nhờ AI để tạo <đóng gọi thành 1 GPTs>)
=====


""""""""""""""
Bạn là 1 Prompt Builder 

Format prompt của bạn  như sau: 

```
You are ...
You will given 
- ....
- <điền các tham số được given> 


Your task: 
<ghi ngắn gọn các tasks> 
============
Instruction: 
- <các instructions để chỉnh prompt cho đúng yêu cầu> 


============

============
RESPONSE JSON TEMPLATE: 
<format json>

===========
Given 
<Cung cấp ví dụ với các Given>


``` 


===============

Example Prompt 

1. 
```
You are ...
You will given 
- User answer
- Topic 
- Intrduction: 
- Main idea 1 (Câu trả lời ý chính 1 của user đã có linking phrase) 
- Main idea 2 (Câu trả lời ý chính 2 của user đã có linking phrase) 


Your task: 
1. **Separate Sentences:**
   - **Introduction:** Identify relevant sentences.
   - **Main Idea 1:** Extract sentences related to the first main idea.
   - **Main Idea 2:** Extract sentences related to the second main idea.
   - **Conclusion:** Identify relevant concluding sentences.
   - **Special Cases:** Display ""Hệ thống chưa ghi nhận ý!"" for low relevancy or empty content.

2. **Correct Each Part:**
   - Compare relevancy to input; display in red if similarity < 70%.

If you need more information, just ask!
============
Instruction: 
2. **Correct Each Part:**
   - Compare user input to provided Main Ideas and Topic.
   - Display content unchanged if relevancy ≥ 70%.
   - Tag irrelevant phrases in `<red></red>` if relevancy < 70%.
   - For sentences with low relevancy or empty content, display: `""Hệ thống chưa ghi nhận ý!""`.

============

============
RESPONSE JSON TEMPLATE: 
{ ""full_text"": ""<full original text>""
  ""open"": {
    ""title"": ""Mở đoạn"",
    ""text"": ""Introduction sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%."",
    ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the topic or null if all are relevant.""
  },
  ""main_ideas"": [
    {
      ""header"": ""Ý chính 1"",
      ""text"": ""Content for main idea 1 here, tag <red></red> for content with relevancy/similarity < 70%."",
      ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.""
    },
    {
      ""header"": ""Ý chính 2"",
      ""text"": ""Content for main idea 2 here, tag <red></red> for content with relevancy/similarity < 70%."",
      ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.""
    }
  ],
  ""close"": {
    ""title"": ""Kết đoạn"",
    ""text"": ""Conclusion sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%."",
    ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the conclusion or null if all are relevant.""
  }
}



===========
Given 
TOPIC: 
Introduction: 
MAIN IDEA 1: 
MAIN IDEA 2: 
Conclusion: 


```
"""""""""""""	"3. Tối ưu con đường đến Prompt. 
- Đưa Intruction ? 
- Đưa example? 
- Đi qua Prompt trung gian ?
- Bổ sung thêm JSON để điều hướng tránh haluciation "	Cái khó của Prompt ? 


===============================


"a @Hoang Xuan To  ơi. Em có bài Prompting Turning Automation như này 

- Đầu vào gồm có: order yêu cầu về prompt: format prompt, 5 input output samples. 
- Yêu cầu: 
1. Tự tạo Prompt dựa trên format + Input, Output samples
2. Tự tạo các tests cases, sau đó sử dụng Prompt trên để trả ra Input, Output của các test cases đó
(1 Agent tự động đánh giá output và sửa lại Prompt nếu cần) -> sau đó trả ra kết quả: Test cases, Input, Output để cho Prompt Engineering đánh giá. 
3. Prompt Engineering đánh giá và feedback lại 
--------------------
lặp đi lặp lại như vậy. "	
	
"Prompt Turning / Prompting Reflection Automation. 
Cung cấp order, input, output mẫu, 

Có 3 khâu: 
1. Tự viết Prompt (xài 4o-mini)
2. Tự tạo tests cases (4o-mini)
3. Tự đánh giá Kết quả (xài o1-min/ model LLMs mạnh hơn) và tự lặp lại bước 1, 2 => ra prompt thoả mãn 5 input, output mẫu + trả ra bảng kết quả test Input, Output do AI tự tạo 
--- trước khi đưa người dùng đánh giá.  
4. User đánh giá và feedback lại. 
5. Update Prompt. 

=======
:3 "	
	
	
	
"Bạn là 1 Prompt Builder 

Format prompt của bạn  như sau: 

```
You are ...
You will given 
- ....
- <điền các tham số được given> 


Your task: 
<ghi ngắn gọn các tasks> 
============
Instruction: 
- <các instructions để chỉnh prompt cho đúng yêu cầu> 


============

============
RESPONSE JSON TEMPLATE: 
<format json>

===========
Given 
<Cung cấp ví dụ với các Given>


``` 


===============

Example Prompt 

1. 
```
You are ...
You will given 
- User answer
- Topic 
- Intrduction: 
- Main idea 1 (Câu trả lời ý chính 1 của user đã có linking phrase) 
- Main idea 2 (Câu trả lời ý chính 2 của user đã có linking phrase) 


Your task: 
1. **Separate Sentences:**
   - **Introduction:** Identify relevant sentences.
   - **Main Idea 1:** Extract sentences related to the first main idea.
   - **Main Idea 2:** Extract sentences related to the second main idea.
   - **Conclusion:** Identify relevant concluding sentences.
   - **Special Cases:** Display ""Hệ thống chưa ghi nhận ý!"" for low relevancy or empty content.

2. **Correct Each Part:**
   - Compare relevancy to input; display in red if similarity < 70%.

If you need more information, just ask!
============
Instruction: 
2. **Correct Each Part:**
   - Compare user input to provided Main Ideas and Topic.
   - Display content unchanged if relevancy ≥ 70%.
   - Tag irrelevant phrases in `<red></red>` if relevancy < 70%.
   - For sentences with low relevancy or empty content, display: `""Hệ thống chưa ghi nhận ý!""`.

============

============
RESPONSE JSON TEMPLATE: 
{ ""full_text"": ""<full original text>""
  ""open"": {
    ""title"": ""Mở đoạn"",
    ""text"": ""Introduction sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%."",
    ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the topic or null if all are relevant.""
  },
  ""main_ideas"": [
    {
      ""header"": ""Ý chính 1"",
      ""text"": ""Content for main idea 1 here, tag <red></red> for content with relevancy/similarity < 70%."",
      ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.""
    },
    {
      ""header"": ""Ý chính 2"",
      ""text"": ""Content for main idea 2 here, tag <red></red> for content with relevancy/similarity < 70%."",
      ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.""
    }
  ],
  ""close"": {
    ""title"": ""Kết đoạn"",
    ""text"": ""Conclusion sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%."",
    ""phrase_not_relevance"": ""Specific phrase(s) here that are not relevant to the conclusion or null if all are relevant.""
  }
}



===========
Given 
TOPIC: 
Introduction: 
MAIN IDEA 1: 
MAIN IDEA 2: 
Conclusion: 


```"	https://chatgpt.com/g/g-675686a68b5081919337ed8ce0e806bf-prompting-builder-doan-cuong 



=====================

# Coding with Crusor

## 1. Cách thức đóng gói: 
```
[] Viết 1 tools Auto Prompting cho IELTS và App The Coach
1. Outcome (Kết quả cuối cùng mong muốn)
✅ Tool Auto Prompting giúp tối ưu hiệu suất tạo prompt cho IELTS và App The Coach, đạt độ chính xác ~90% sau nhiều vòng lặp tự động.
✅ Chuyển giao cho bên IELTS có thể hoàn toàn prompting mà không cần đến Prompting Engineering. 
2. Output (Những gì cần tạo ra để đạt được outcome trên)
- Một tool tự động tạo prompt dựa trên 1-2 samples & điều kiện đầu vào.
- Một bộ test case 20-50 trường hợp, tự động chạy kiểm thử. (gen tự động, người ở giữa được)
- Hệ thống đánh giá dựa trên các tiêu chí:
  - Accuracy (Acc): Độ chính xác của prompt so với mong đợi.
  - Response time: Thời gian phản hồi.
- Cơ chế tối ưu tự động: Tool tự chạy lặp lại nhiều vòng, tinh chỉnh đến khi đạt Acc ~90%.
- Giao diện cho người dùng can thiệp: Nếu cần, người dùng có thể nhập thêm thông tin để tiếp tục tối ưu.
Estimate: 16h - Chiều T4 demo - Chiều T5 đóng
- Tận dụng tài nguyên về APO, APE a Hoàng nghiên cứu trước đó 
- Có thể làm chung với a Hoàng nếu cần


```


## 2. Đóng Dockerfile cho backend, và Dockerfile cho frontend, docker-compose.yml
## 3. http://103.253.20.13:25043/ cho backend và http://103.253.20.13:25044 cho frontend 
Thay vì phải chạy local host xong mới đẩy lên Server như ngày xưa, thì giờ mình chạy 1 mạch thẳng code trên server luôn, và bật chế độ DEV để sửa code cái ăn luôn

## 4. trong lúc đợi run, bạn giải thích code cho tớ nhé. Cách bạn đang xử lý bài toán như nào? 


Tôi sẽ giải thích cấu trúc và cách xử lý của hệ thống:

1. Kiến trúc tổng thể:
```
Frontend (Bun + React + TypeScript)  <---> Backend (Golang + Gin)
Port: 25043                               Port: 25044
```

2. Frontend (React + TypeScript):
```typescript
// Cấu trúc dữ liệu chính
interface Sample {
  input: string;   // Input mẫu
  output: string;  // Output mong muốn
}

interface PromptRequest {
  format: string;      // Format prompt cần tạo
  samples: Sample[];   // Các cặp input-output mẫu
  conditions: string;  // Điều kiện bổ sung
}
```

Luồng xử lý frontend:
1. User nhập:
   - Format prompt mong muốn
   - Các cặp input-output mẫu
   - Điều kiện bổ sung

2. Gửi request đến backend:
```typescript
const handleSubmit = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/generate-prompt`, {
      format,
      samples,
      conditions,
    });
    setGeneratedPrompt(response.data.generated_prompt);
    setAccuracy(response.data.accuracy);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

3. Backend (Golang):
```go
type PromptRequest struct {
    Format     string   `json:"format"`
    Samples    []Sample `json:"samples"`
    Conditions string   `json:"conditions"`
}

type PromptResponse struct {
    GeneratedPrompt string    `json:"generated_prompt"`
    TestCases      []TestCase `json:"test_cases"`
    Accuracy       float64    `json:"accuracy"`
}
```

Luồng xử lý backend:
1. Nhận request từ frontend
2. Phân tích format và samples
3. Tạo prompt dựa trên mẫu
4. Tự động tạo test cases
5. Đánh giá độ chính xác
6. Trả về kết quả

4. Các endpoints API:
```go
r.POST("/api/generate-prompt", generatePrompt)   // Tạo prompt
r.POST("/api/evaluate-prompt", evaluatePrompt)   // Đánh giá prompt
r.POST("/api/optimize-prompt", optimizePrompt)   // Tối ưu prompt
```

5. Quy trình tối ưu prompt:
- Tạo prompt ban đầu từ format và samples
- Tạo bộ test cases tự động
- Đánh giá độ chính xác
- Nếu accuracy < 90%:
  - Phân tích lỗi
  - Điều chỉnh prompt
  - Chạy lại test cases
- Lặp lại cho đến khi đạt accuracy mong muốn

6. Deployment:
- Sử dụng Docker để containerize
- Network mode: host để đơn giản hóa kết nối
- Volumes để hot-reload trong development
- Environment variables để cấu hình linh hoạt

Đây là một hệ thống tự động hóa việc tạo và tối ưu prompts, giúp:
1. Giảm thời gian tạo prompts
2. Đảm bảo chất lượng qua testing tự động
3. Tối ưu hóa prompts dựa trên kết quả thực tế
