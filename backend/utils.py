import random
import time
import os
from openai import OpenAI
import logging
from typing import List, Tuple
from models import Sample, PromptTestCase

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

def generate_prompt_from_samples(fmt: str, samples: List[Sample], conditions: str) -> str:
    """Generate a prompt based on format, samples and conditions using 4o-mini"""
    
    try:
        # Validate API key first
        api_key = validate_api_key()
        
        # Initialize OpenAI client with validated key
        client = OpenAI(
            api_key=api_key,
            timeout=60.0  # Increased timeout
        )
        
        # Format samples into input-output pairs
        sample_pairs = "\n".join([
            f"Input: {s.input}\nOutput: {s.output}" 
            for s in samples
        ])
        
        # Construct user message
        user_message = f"""
1. ĐIỀU KIỆN:
{conditions}

2. SAMPLE INPUT - OUTPUT:
{sample_pairs}

3. RESPONSE FORMAT:
{fmt}
"""
        
        # Prepare messages
        messages = [
            {
                "role": "system",
                "content": "Bạn là 1 Prompt Builder\n\nFormat prompt của bạn như sau: ..."
            },
            {
                "role": "user", 
                "content": user_message
            }
        ]

        # Call API with retry mechanism
        logger.info("Calling 4o-mini API...")
        response = call_openai_api(client, messages)
        
        # Extract generated prompt from response
        generated_prompt = response.choices[0].message.content
        
        # Log the generated prompt
        logger.info(f"Generated prompt:\n{generated_prompt}")
        
        return generated_prompt
        
    except Exception as e:
        logger.error(f"Error calling 4o-mini API: {str(e)}", exc_info=True)
        # Fallback to basic prompt generation if API call fails
        base = f"Format: {fmt}\n"
        sample_str = "\n".join([f"Input: {s.input} => Output: {s.output}" for s in samples])
        cond_str = f"Conditions: {conditions}" if conditions else ""
        fallback_prompt = f"{base}{sample_str}\n{cond_str}"
        logger.info(f"Using fallback prompt:\n{fallback_prompt}")
        return fallback_prompt

def generate_test_cases(prompt: str) -> List[PromptTestCase]:
    """Generate test cases for the given prompt"""
    test_cases = []
    for i in range(5):
        expected = f"Expected output {i}"
        actual = expected if random.random() > 0.3 else f"Wrong output {i}"
        test_cases.append(
            PromptTestCase(
                input=f"Test input {i}",
                expected_output=expected,
                actual_output=actual,
                is_correct=actual == expected,
                similarity_score=1.0 if actual == expected else random.uniform(0.5, 0.7)
            )
        )
    return test_cases

def evaluate_prompt(prompt: str, test_cases: List[PromptTestCase]) -> Tuple[float, float]:
    """Evaluate the prompt using test cases"""
    start = time.time()
    correct_cases = sum(1 for tc in test_cases if tc.is_correct)
    accuracy = correct_cases / len(test_cases)
    response_time = time.time() - start
    return accuracy, response_time

def update_prompt(current_prompt: str, test_cases: List[PromptTestCase], accuracy: float) -> str:
    """Update prompt based on evaluation results"""
    # In a real implementation, this would use ML to improve the prompt
    return current_prompt + f"\n[Updated based on accuracy: {accuracy:.2f}]" 