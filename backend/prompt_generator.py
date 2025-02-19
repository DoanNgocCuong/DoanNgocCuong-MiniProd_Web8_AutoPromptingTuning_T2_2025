import logging
import os
from openai import OpenAI
from typing import List
from models import Sample
import openai

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
                max_tokens=2048,
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
            time.sleep(try_count)

def generate_prompt(format_output: str, samples: List[Sample], conditions: str) -> str:
    """Generate a prompt using OpenAI API"""
    try:
        # Validate API key first
        api_key = validate_api_key()
        
        # Initialize OpenAI client with validated key
        client = openai.OpenAI(api_key=api_key)
        
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
{format_output}
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
        base = f"Format: {format_output}\n"
        sample_str = "\n".join([f"Input: {s.input} => Output: {s.output}" for s in samples])
        cond_str = f"Conditions: {conditions}" if conditions else ""
        fallback_prompt = f"{base}{sample_str}\n{cond_str}"
        logger.info(f"Using fallback prompt:\n{fallback_prompt}")
        return fallback_prompt 