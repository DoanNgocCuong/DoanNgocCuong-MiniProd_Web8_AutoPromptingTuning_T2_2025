import pytest
import sys
from pathlib import Path

# Add backend directory to Python path
backend_path = str(Path(__file__).parent.parent.absolute())
sys.path.insert(0, backend_path)

from models import Sample, PromptTestCase
from utils import (
    generate_prompt_from_samples,
    generate_test_cases,
    evaluate_prompt,
    update_prompt
)

def test_generate_prompt_from_samples():
    samples = [
        Sample(input="hello", output="world"),
        Sample(input="test", output="case")
    ]
    format_str = "Input: {input} -> Output: {output}"
    conditions = "Keep responses short"
    
    result = generate_prompt_from_samples(format_str, samples, conditions)
    
    assert "Format: " in result
    assert "Input: hello => Output: world" in result
    assert "Input: test => Output: case" in result
    assert "Conditions: Keep responses short" in result

def test_generate_test_cases():
    prompt = "Test prompt"
    test_cases = generate_test_cases(prompt)
    
    assert len(test_cases) == 5
    for test_case in test_cases:
        assert isinstance(test_case, PromptTestCase)
        assert isinstance(test_case.input, str)
        assert isinstance(test_case.expected_output, str)
        assert isinstance(test_case.actual_output, str)
        assert isinstance(test_case.is_correct, bool)
        assert 0 <= test_case.similarity_score <= 1

def test_evaluate_prompt():
    prompt = "Test prompt"
    test_cases = [
        PromptTestCase(
            input="test1",
            expected_output="output1",
            actual_output="output1",
            is_correct=True,
            similarity_score=1.0
        ),
        PromptTestCase(
            input="test2",
            expected_output="output2",
            actual_output="wrong",
            is_correct=False,
            similarity_score=0.5
        )
    ]
    
    accuracy, response_time = evaluate_prompt(prompt, test_cases)
    
    assert accuracy == 0.5  # 1 out of 2 correct
    assert response_time > 0

def test_update_prompt():
    current_prompt = "Original prompt"
    test_cases = [
        PromptTestCase(
            input="test1",
            expected_output="output1",
            actual_output="output1",
            is_correct=True,
            similarity_score=1.0
        )
    ]
    accuracy = 0.75
    
    updated_prompt = update_prompt(current_prompt, test_cases, accuracy)
    
    assert current_prompt in updated_prompt
    assert "0.75" in updated_prompt 