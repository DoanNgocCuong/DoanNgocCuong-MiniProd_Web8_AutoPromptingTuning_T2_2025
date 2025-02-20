from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from typing import List
import time
from pydantic import BaseModel
from run_prompt_with_testcases import PromptTestRunner
from run_prompt_evaluate import PromptEvaluator

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
    EvaluationResponse,
    RunPromptRequest,
    RunPromptResponse,
    EvaluatePromptRequest,
    EvaluatePromptResponse
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

# Initialize runners
test_runner = PromptTestRunner()
evaluator = PromptEvaluator()

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
    generated_prompt = generate_prompt_from_samples(
        format_output=request.format,
        samples=request.samples,
        conditions=request.conditions
    )
    
    # Log the generated prompt
    logger.info(f"API generated prompt:\n{generated_prompt}")
    
    iteration = request.iteration
    optimization_history = []
    
    # Generate and evaluate test cases
    test_cases = gen_test_cases(
        format_output=request.format,
        samples=request.samples,
        conditions=request.conditions
    )
    accuracy, response_time = evaluate_prompt(generated_prompt, test_cases)
    
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
        generated_prompt = update_prompt(generated_prompt, test_cases, accuracy)
        test_cases = gen_test_cases(generated_prompt)
        accuracy, response_time = evaluate_prompt(generated_prompt, test_cases)
        
        optimization_history.append(
            OptimizationHistory(
                iteration=iteration,
                accuracy=accuracy,
                response_time=response_time
            )
        )

    return PromptResponse(
        generated_prompt=generated_prompt,
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

@app.post("/api/generate-prompt-and-testcases", response_model=PromptAndTestResponse)
async def generate_prompt_and_test_endpoint(request: PromptAndTestRequest):
    """Generate prompt and test cases in one call"""
    try:
        start_time = time.time()
        
        # Step 1: Generate prompt
        generated_prompt = generate_prompt_from_samples(
            format_output=request.format,
            samples=request.samples,
            conditions=request.conditions
        )
        logger.info(f"Generated prompt:\n{generated_prompt}")
        
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
            generated_prompt=generated_prompt,
            test_cases=test_cases,
            total_time=total_time
        )
        
    except Exception as e:
        logger.error(f"Error in generate_prompt_and_test: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate prompt and test cases: {str(e)}"
        )

@app.post("/api/run-prompt", response_model=RunPromptResponse)
async def run_prompt_endpoint(request: RunPromptRequest):
    """Chạy prompt với test cases và trả về kết quả"""
    try:
        start_time = time.time()
        
        # Run prompt với test cases đã có
        test_cases = test_runner.run_with_testcases(
            prompt=request.prompt,  # Sử dụng prompt trực tiếp từ request
            test_cases=request.test_cases  # Sử dụng test cases từ request
        )
        
        total_time = time.time() - start_time
        
        return RunPromptResponse(
            test_cases=test_cases,
            total_time=total_time
        )
        
    except Exception as e:
        logger.error(f"Error running prompt: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run prompt: {str(e)}"
        )

@app.post("/api/evaluate-results", response_model=EvaluatePromptResponse) 
async def evaluate_results_endpoint(request: EvaluatePromptRequest):
    """Đánh giá kết quả của prompt với expected output"""
    try:
        # Đánh giá test cases
        results = evaluator.evaluate_testcases(request.test_cases)
        
        return EvaluatePromptResponse(
            accuracy=results.accuracy,
            avg_similarity=results.avg_similarity,
            test_cases=results.test_cases
        )
        
    except Exception as e:
        logger.error(f"Error evaluating results: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate results: {str(e)}"
        ) 