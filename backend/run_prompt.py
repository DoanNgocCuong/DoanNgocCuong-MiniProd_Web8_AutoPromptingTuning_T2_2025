import logging
import os
import time
from typing import List, Dict
import openai
import httpx
from models import PromptInput, PromptOutput

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptRunner:
    def __init__(self):
        # Khởi tạo OpenAI client
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

    def run_single_prompt(self, prompt: str, input_text: str) -> PromptOutput:
        """Chạy một prompt với một input"""
        try:
            start_time = time.time()
            
            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": input_text}
            ]
            
            completion = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0,
                max_tokens=2048
            )
            
            output = completion.choices[0].message.content.strip()
            response_time = time.time() - start_time
            
            return PromptOutput(
                input=input_text,
                output=output,
                response_time=response_time
            )
            
        except Exception as e:
            logger.error(f"Error running prompt: {str(e)}")
            return PromptOutput(
                input=input_text,
                output="",
                response_time=0.0
            )

    def run_batch_prompts(self, prompt: str, inputs: List[str]) -> List[PromptOutput]:
        """Chạy một prompt với nhiều input"""
        outputs = []
        for input_text in inputs:
            output = self.run_single_prompt(prompt, input_text)
            outputs.append(output)
        return outputs 