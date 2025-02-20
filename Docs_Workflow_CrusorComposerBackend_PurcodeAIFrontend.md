1. Gen Prompt và Test cases (dựa vào: Format JSON + Samples Input Output + Conditions Promp)
=> 1 API: /api/generate-prompt-and-testcases

2. Chạy Prompt và Test cases (dựa vào: Prompt + Test cases)
=> 1 API: /api/run-prompt

3. Đánh giá Kết quả (Prompt so sánh output_prompt vs Expected_output từ Test Cases). 
=> 1 API: /api/evaluate-results


---

UI: 
Step 1: 
- User nhập 3 ô: Format JSON + Samples Input Output + Conditions Promp + Số lượng test cases
- Nhấn nút: Gen Prompt và Test cases (call đến API: /api/generate-prompt-and-testcases)
-> Ouput trả ra là prompt và test cases


Output step 1: User được chỉnh sửa Prompt và Test Cases (CRUD) 


Step 2: 
- User nhấn nút: Run Prompt (call đến API: /api/run-prompt)

Output step 2: 

Step 3: 
- User nhấn nút: Evaluate Results (call đến API: /api/evaluate-results)
-> Ouput trả ra là kết quả đánh giá

Output step 3: 

Note: 
- Sample Input Output là dạng 2 cột, 3 5 dòng Input Output samples
- Ngoài ra có nút: Generate Prompt Again (call đến API: /api/generate-prompt)
- Thế còn Run Prompt và Evaluate Results thì như thế nào? 