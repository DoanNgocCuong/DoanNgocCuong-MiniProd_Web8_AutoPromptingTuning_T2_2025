from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from typing import List
import time
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

from models import (
    PromptRequest, 
    PromptResponse, 
    FeedbackRequest, 
    OptimizationHistory,
    TestCaseRequest,  # New model
    TestCaseResponse,  # New model
    Sample,
    PromptTestCase,
    PromptAndTestRequest,
    PromptAndTestResponse,
    EvaluationRequest,
    EvaluationResponse
)
from utils import (
    generate_prompt_from_samples,
    evaluate_prompt,
    update_prompt
)
from test_case_generator import generate_test_cases as gen_test_cases

app = FastAPI(title="Auto Prompting Tool API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_ITERATIONS = 5

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/generate-test-cases", response_model=TestCaseResponse)
async def generate_test_cases_endpoint(request: TestCaseRequest):
    """Generate test cases based on format, samples and conditions"""
    try:
        start_time = time.time()
        
        # Generate test cases using the test case generator
        test_cases = gen_test_cases(
            format_output=request.format,
            samples=request.samples,
            conditions=request.conditions,
            num_cases=request.num_cases
        )
        
        generation_time = time.time() - start_time
        
        return TestCaseResponse(
            test_cases=test_cases,
            total_cases=len(test_cases),
            generation_time=generation_time
        )
        
    except Exception as e:
        logger.error(f"Error generating test cases: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate test cases: {str(e)}"
        )

@app.post("/api/generate-prompt", response_model=PromptResponse)
async def generate_prompt_endpoint(request: PromptRequest):
    # Initial prompt generation
    prompt = generate_prompt_from_samples(
        format_output=request.format,
        samples=request.samples,
        conditions=request.conditions
    )
    
    # Log the generated prompt
    logger.info(f"API generated prompt:\n{prompt}")
    
    iteration = request.iteration
    optimization_history = []
    
    # Generate and evaluate test cases
    test_cases = gen_test_cases(
        format_output=request.format,
        samples=request.samples,
        conditions=request.conditions
    )
    accuracy, response_time = evaluate_prompt(prompt, test_cases)
    
    # Record initial results
    optimization_history.append(
        OptimizationHistory(
            iteration=iteration,
            accuracy=accuracy,
            response_time=response_time
        )
    )

    # Iterative improvement loop
    while accuracy < 0.9 and iteration < MAX_ITERATIONS:
        iteration += 1
        prompt = update_prompt(prompt, test_cases, accuracy)
        test_cases = gen_test_cases(prompt)
        accuracy, response_time = evaluate_prompt(prompt, test_cases)
        
        optimization_history.append(
            OptimizationHistory(
                iteration=iteration,
                accuracy=accuracy,
                response_time=response_time
            )
        )

    return PromptResponse(
        generated_prompt=prompt,
        test_cases=test_cases,
        accuracy=accuracy,
        response_time=response_time,
        iteration=iteration,
        optimization_history=optimization_history
    )

@app.post("/api/feedback")
async def feedback_endpoint(request: FeedbackRequest):
    # Here you would typically store the feedback and potentially
    # use it to improve the prompt generation system
    print(f"Received feedback for prompt: {request.feedback}")
    return {"message": "Feedback received successfully"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/generate-prompt-and-test", response_model=PromptAndTestResponse)
async def generate_prompt_and_test_endpoint(request: PromptAndTestRequest):
    """Generate prompt and test cases in one call"""
    try:
        start_time = time.time()
        
        # Step 1: Generate prompt
        prompt = generate_prompt_from_samples(
            format_output=request.format,
            samples=request.samples,
            conditions=request.conditions
        )
        logger.info(f"Generated prompt:\n{prompt}")
        
        # Step 2: Generate test cases
        test_cases = gen_test_cases(
            format_output=request.format,
            samples=request.samples,
            conditions=request.conditions,
            num_cases=request.num_test_cases
        )
        logger.info(f"Generated {len(test_cases)} test cases")
        
        total_time = time.time() - start_time
        
        return PromptAndTestResponse(
            prompt=prompt,
            test_cases=test_cases,
            total_time=total_time
        )
        
    except Exception as e:
        logger.error(f"Error in generate_prompt_and_test: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate prompt and test cases: {str(e)}"
        )

@app.post("/api/evaluate-prompt", response_model=EvaluationResponse)
async def evaluate_prompt_endpoint(request: EvaluationRequest):
    """Evaluate a prompt against test cases"""
    try:
        start_time = time.time()
        
        # Evaluate prompt against test cases
        accuracy, response_time = evaluate_prompt(request.prompt, request.test_cases)
        logger.info(f"Evaluation results - Accuracy: {accuracy}, Response time: {response_time}")
        
        total_time = time.time() - start_time
        
        return EvaluationResponse(
            accuracy=accuracy,
            response_time=response_time,
            total_time=total_time,
            test_results=request.test_cases  # Now includes actual outputs and is_correct flags
        )
        
    except Exception as e:
        logger.error(f"Error in evaluate_prompt: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate prompt: {str(e)}"
        ) 