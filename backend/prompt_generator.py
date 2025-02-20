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

def generate_prompt(format_output: str, samples: List[Sample], conditions: str, num_testcases: int = 1) -> str:
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
        
        # Construct user message with num_testcases
        user_message = f"""
1. ĐIỀU KIỆN:
{conditions}

2. SAMPLE INPUT - OUTPUT:
{sample_pairs}

3. RESPONSE FORMAT:
{format_output}

4. NUMBER OF TEST CASES REQUIRED: {num_testcases}
"""
        
        # Prepare messages
        messages = [
            {
                "role": "system",
                "content": "Bạn là 1 Prompt Builder \n\nFormat prompt của bạn như sau: \n\n```\nYou are ...\nYou will be given \n- ....\n- <điền các tham số được given> \n\n\nYour task: \n<ghi ngắn gọn các tasks> \n============\nInstruction: \n- <các instructions để chỉnh prompt cho đúng yêu cầu> \n\n\n============\n\n============\nRESPONSE JSON TEMPLATE: \n<format json>\n\n===========\nGiven \n<Cung cấp ví dụ với các Given>\n\n\n``` \n\n\n===============\n\nExample Prompt \n\n1. \n```\nYou are ...\nYou will be given \n- User answer\n- Topic \n- Introduction: \n- Main idea 1 (Câu trả lời ý chính 1 của user đã có linking phrase) \n- Main idea 2 (Câu trả lời ý chính 2 của user đã có linking phrase) \n\n\nYour task: \n1. **Separate Sentences:**\n   - **Introduction:** Identify relevant sentences.\n   - **Main Idea 1:** Extract sentences related to the first main idea.\n   - **Main Idea 2:** Extract sentences related to the second main idea.\n   - **Conclusion:** Identify relevant concluding sentences.\n   - **Special Cases:** Display \"Hệ thống chưa ghi nhận ý!\" for low relevancy or empty content.\n\n2. **Correct Each Part:**\n   - Compare relevancy to input; display in red if similarity < 70%.\n\nIf you need more information, just ask!\n============\nInstruction: \n2. **Correct Each Part:**\n   - Compare user input to provided Main Ideas and Topic.\n   - Display content unchanged if relevancy ≥ 70%.\n   - Tag irrelevant phrases in `<red></red>` if relevancy < 70%.\n   - For sentences with low relevancy or empty content, display: `\"Hệ thống chưa ghi nhận ý!\"`.\n\n============\n\n============\nRESPONSE JSON TEMPLATE: \n{ \"full_text\": \"<full original text>\"\n  \"open\": {\n    \"title\": \"Mở đoạn\",\n    \"text\": \"Introduction sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%.\",\n    \"phrase_not_relevance\": \"Specific phrase(s) here that are not relevant to the topic or null if all are relevant.\"\n  },\n  \"main_ideas\": [\n    {\n      \"header\": \"Ý chính 1\",\n      \"text\": \"Content for main idea 1 here, tag <red></red> for content with relevancy/similarity < 70%.\",\n      \"phrase_not_relevance\": \"Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.\"\n    },\n    {\n      \"header\": \"Ý chính 2\",\n      \"text\": \"Content for main idea 2 here, tag <red></red> for content with relevancy/similarity < 70%.\",\n      \"phrase_not_relevance\": \"Specific phrase(s) here that are not relevant to the main idea or null if all are relevant.\"\n    }\n  ],\n  \"close\": {\n    \"title\": \"Kết đoạn\",\n    \"text\": \"Conclusion sentence(s) here, tag <red></red> for content with relevancy/similarity < 70%.\",\n    \"phrase_not_relevance\": \"Specific phrase(s) here that are not relevant to the conclusion or null if all are relevant.\"\n  }\n}\n\n\n\n===========\nGiven \nTOPIC: \nIntroduction: \nMAIN IDEA 1: \nMAIN IDEA 2: \nConclusion: \n\n\n```"
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