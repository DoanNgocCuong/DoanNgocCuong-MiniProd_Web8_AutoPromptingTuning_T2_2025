import random
import time
import os
from openai import OpenAI
import os
from openai import OpenAI
from typing import List, Tuple
from models import Sample, PromptTestCase

def generate_prompt_from_samples(fmt: str, samples: List[Sample], conditions: str) -> str:
    """Generate a prompt based on format, samples and conditions using 4o-mini"""
    
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
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
    
    try:
        # Call 4o-mini API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "Bạn là 1 Prompt Builder\n\nFormat prompt của bạn như sau: ..."
                        }
                    ]
                },
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": user_message
                        }
                    ]
                }
            ],
            response_format={"type": "text"},
            temperature=1,
            max_completion_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        
        # Extract generated prompt from response
        generated_prompt = response.choices[0].message.content
        
        return generated_prompt
        
    except Exception as e:
        print(f"Error calling 4o-mini API: {str(e)}")
        # Fallback to basic prompt generation if API call fails
        base = f"Format: {fmt}\n"
        sample_str = "\n".join([f"Input: {s.input} => Output: {s.output}" for s in samples])
        cond_str = f"Conditions: {conditions}" if conditions else ""
        return f"{base}{sample_str}\n{cond_str}"

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