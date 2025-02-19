import random
import time
import os
from openai import OpenAI
import logging
from typing import List, Tuple
from models import Sample, PromptTestCase
from prompt_generator import generate_prompt
from test_case_generator import generate_test_cases as gen_test_cases

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_api_key():
    """Validate OpenAI API key"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    if not (api_key.startswith('sk-') or api_key.startswith('sk-proj-')):
        raise ValueError("Invalid OpenAI API key format")
    return api_key

def call_openai_api(client, messages, max_retries=3):
    """Call OpenAI API with manual retry mechanism"""
    try_count = 0
    while try_count < max_retries:
        try:
            logger.info(f"Attempt {try_count + 1} to call OpenAI API")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                response_format={"type": "text"},
                temperature=1,
                max_tokens=2048,  # Changed from max_completion_tokens
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            return response
        except Exception as e:
            try_count += 1
            if try_count == max_retries:
                logger.error(f"Failed after {max_retries} attempts: {str(e)}")
                raise
            logger.warning(f"Attempt {try_count} failed: {str(e)}. Retrying in {try_count} seconds...")
            time.sleep(try_count)  # Linear backoff

def generate_prompt_from_samples(format_output: str, samples: List[Sample], conditions: str) -> str:
    """Generate a prompt based on format, samples and conditions"""
    return generate_prompt(format_output, samples, conditions)

def generate_test_cases(prompt: str, num_cases: int = 5) -> List[PromptTestCase]:
    """Generate test cases for the given prompt"""
    # Parse format, samples, and conditions from prompt
    lines = prompt.split("\n")
    fmt = lines[0].replace("Format: ", "")
    
    samples = []
    conditions = ""
    
    for line in lines[1:]:
        if "=>" in line:
            input_text, output = line.split("=>")
            samples.append(Sample(
                input=input_text.replace("Input: ", "").strip(),
                output=output.replace("Output: ", "").strip()
            ))
        elif "Conditions:" in line:
            conditions = line.replace("Conditions: ", "")
    
    return gen_test_cases(fmt, samples, conditions, num_cases)

def evaluate_prompt(prompt: str, test_cases: List[PromptTestCase]) -> Tuple[float, float]:
    """Evaluate the prompt using test cases"""
    try:
        start = time.time()
        
        # Initialize OpenAI client
        client = OpenAI(
            api_key=os.getenv('OPENAI_API_KEY'),
            timeout=60.0
        )
        
        correct_cases = 0
        
        for test_case in test_cases:
            try:
                # Call API with prompt and test input
                messages = [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": test_case.input
                    }
                ]
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024
                )
                
                # Get model's output
                actual_output = response.choices[0].message.content.strip()
                
                # Compare with expected output
                test_case.actual_output = actual_output
                test_case.is_correct = actual_output == test_case.expected_output
                
                if test_case.is_correct:
                    correct_cases += 1
                    
            except Exception as e:
                logger.error(f"Error evaluating test case: {str(e)}")
                continue
        
        accuracy = correct_cases / len(test_cases) if test_cases else 0
        response_time = time.time() - start
        
        return accuracy, response_time
        
    except Exception as e:
        logger.error(f"Error in evaluate_prompt: {str(e)}", exc_info=True)
        return 0.0, 0.0

def update_prompt(current_prompt: str, test_cases: List[PromptTestCase], accuracy: float) -> str:
    """Update prompt based on evaluation results"""
    return current_prompt + f"\n[Updated based on accuracy: {accuracy:.2f}]" 