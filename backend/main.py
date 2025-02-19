from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import PromptRequest, PromptResponse, FeedbackRequest, OptimizationHistory
from .utils import (
    generate_prompt_from_samples,
    generate_test_cases,
    evaluate_prompt,
    update_prompt
)

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

@app.post("/api/generate-prompt", response_model=PromptResponse)
async def generate_prompt_endpoint(request: PromptRequest):
    # Initial prompt generation
    prompt = generate_prompt_from_samples(
        request.format,
        request.samples,
        request.conditions
    )
    
    iteration = request.iteration
    optimization_history = []
    
    # Generate and evaluate test cases
    test_cases = generate_test_cases(prompt)
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
        test_cases = generate_test_cases(prompt)
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