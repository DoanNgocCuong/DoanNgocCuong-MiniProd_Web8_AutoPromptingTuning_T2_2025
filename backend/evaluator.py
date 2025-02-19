import logging
import os
import time
from typing import List, Dict, Tuple
import openai
import httpx
from models import PromptTestCase
import concurrent.futures
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptEvaluator:
    def __init__(self, max_workers: int = 4, batch_size: int = 4):
        self.max_workers = max_workers
        self.batch_size = batch_size
        
        # Khởi tạo OpenAI client với httpx client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
            
        http_client = httpx.Client(
            base_url="https://api.openai.com/v1",
            timeout=60.0,
            follow_redirects=True
        )
        
        self.client = openai.OpenAI(
            api_key=api_key,
            http_client=http_client
        )

    def evaluate_single_test(self, prompt: str, test_case: PromptTestCase) -> Tuple[bool, float, float]:
        """Evaluate a single test case"""
        start_time = time.time()
        try_count = 0
        
        while try_count < 3:
            try:
                # Gửi prompt + input đến OpenAI
                messages = [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": test_case.input}
                ]
                
                completion = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0,
                    max_tokens=2048
                )
                
                # Lấy output từ prompt
                prompt_output = completion.choices[0].message.content.strip()
                response_time = time.time() - start_time
                
                # So sánh với expected output
                is_correct = prompt_output == test_case.expected_output
                
                # Cập nhật test case
                test_case.prompt_output = prompt_output  # Lưu output từ prompt
                test_case.is_correct = is_correct
                
                return is_correct, response_time, 0.7
                
            except Exception as e:
                try_count += 1
                logger.warning(f"Attempt {try_count} failed: {str(e)}")
                if try_count < 3:
                    time.sleep(try_count * 2)
                    
        return False, 0.0, 0.0

    def process_batch(self, prompt: str, test_cases: List[PromptTestCase]) -> List[Dict]:
        """Process a batch of test cases"""
        results = []
        for test_case in test_cases:
            is_correct, response_time, similarity = self.evaluate_single_test(prompt, test_case)
            results.append({
                "test_case": test_case,
                "is_correct": is_correct,
                "response_time": response_time,
                "similarity_score": similarity
            })
        return results

    def evaluate_prompt(self, prompt: str, test_cases: List[PromptTestCase]) -> Dict:
        """Evaluate prompt against all test cases"""
        start_time = time.time()
        
        # Split test cases into batches
        batches = [
            test_cases[i:i + self.batch_size] 
            for i in range(0, len(test_cases), self.batch_size)
        ]
        
        all_results = []
        failed_batches = []
        
        # Process batches in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = [
                executor.submit(self.process_batch, prompt, batch) 
                for batch in batches
            ]
            
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                try:
                    batch_results = future.result()
                    all_results.extend(batch_results)
                except Exception as e:
                    logger.error(f"Error processing batch {i}: {str(e)}")
                    failed_batches.append(i)
        
        # Calculate metrics
        total_correct = sum(1 for r in all_results if r["is_correct"])
        accuracy = total_correct / len(test_cases) if test_cases else 0
        avg_response_time = sum(r["response_time"] for r in all_results) / len(all_results) if all_results else 0
        total_time = time.time() - start_time
        
        return {
            "accuracy": accuracy,
            "avg_response_time": avg_response_time,
            "total_time": total_time,
            "total_test_cases": len(test_cases),
            "successful_tests": total_correct,
            "failed_batches": failed_batches,
            "test_results": [r["test_case"] for r in all_results]
        } 