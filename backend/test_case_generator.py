import logging
import os
from openai import OpenAI
from typing import List
from models import Sample, PromptTestCase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def call_openai_api(client, messages, max_retries=3):
    """Call OpenAI API with manual retry mechanism"""
    try_count = 0
    while try_count < max_retries:
        try:
            logger.info(f"Attempt {try_count + 1} to call OpenAI API for test cases")
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                response_format={"type": "text"},
                temperature=0.7,  # Lower temperature for more focused test cases
                max_tokens=2048,
                top_p=1,
                frequency_penalty=0.2,  # Slight increase to encourage variety
                presence_penalty=0.2
            )
            return response
        except Exception as e:
            try_count += 1
            if try_count == max_retries:
                logger.error(f"Failed after {max_retries} attempts: {str(e)}")
                raise
            logger.warning(f"Attempt {try_count} failed: {str(e)}. Retrying in {try_count} seconds...")
            time.sleep(try_count)

def generate_test_cases(format_output: str, samples: List[Sample], conditions: str, num_cases: int = 5) -> List[PromptTestCase]:
    """Generate test cases using OpenAI API"""
    try:
        # Initialize OpenAI client
        client = OpenAI(
            api_key=os.getenv('OPENAI_API_KEY'),
            timeout=60.0
        )
        
        # Format samples into input-output pairs
        sample_pairs = "\n".join([
            f"Input: {s.input}\nOutput: {s.output}" 
            for s in samples
        ])
        
        # Construct user message with clearer format
        user_message = f"""
Please generate {num_cases} test cases for grammar correction with this format:

Format: {format_output}
Conditions: {conditions}

Example:
{sample_pairs}

For each test case, follow this EXACT format (no extra text):
---
Input: <test input>
Expected: <correct grammar>
Wrong: <incorrect grammar>
Score: <similarity score between 0.0-1.0>
---

Generate {num_cases} test cases, each separated by ---
"""
        
        # Prepare messages
        messages = [
            {
                "role": "system",
                "content": "You are a Test Case Generator. Respond ONLY with test cases in the exact format requested."
            },
            {
                "role": "user", 
                "content": user_message
            }
        ]

        # Call API
        logger.info("Generating test cases...")
        response = call_openai_api(client, messages)
        
        # Parse response into test cases
        test_cases = []
        raw_cases = response.choices[0].message.content.split("---\n")[1:-1]  # Skip first/last empty parts
        
        for raw_case in raw_cases:
            try:
                # Parse each line
                lines = {
                    line.split(": ")[0].strip(): line.split(": ")[1].strip()
                    for line in raw_case.strip().split("\n")
                    if ": " in line
                }
                
                test_cases.append(
                    PromptTestCase(
                        input=lines.get("Input", ""),
                        expected_output=lines.get("Expected", ""),
                        actual_output=lines.get("Wrong", ""),
                        is_correct=False,  # Will be evaluated later
                        similarity_score=float(lines.get("Score", "0.7"))
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to parse test case: {e}\nRaw case:\n{raw_case}")
                continue
                
        # Ensure we have at least one test case
        if not test_cases:
            logger.warning("No test cases parsed successfully, using fallback")
            return [
                PromptTestCase(
                    input=f"Test input {i}",
                    expected_output=f"Expected output {i}",
                    actual_output=f"Wrong output {i}",
                    is_correct=False,
                    similarity_score=0.7
                )
                for i in range(num_cases)
            ]
            
        logger.info(f"Generated {len(test_cases)} test cases")
        return test_cases
        
    except Exception as e:
        logger.error(f"Error generating test cases: {str(e)}", exc_info=True)
        # Fallback to basic test case generation
        return [
            PromptTestCase(
                input=f"Test input {i}",
                expected_output=f"Expected output {i}",
                actual_output=f"Wrong output {i}",
                is_correct=False,
                similarity_score=0.7
            )
            for i in range(num_cases)
        ] 