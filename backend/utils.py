import random
import time
from typing import List, Tuple
from .models import Sample, TestCase

def generate_prompt_from_samples(fmt: str, samples: List[Sample], conditions: str) -> str:
    """Generate a prompt based on format, samples and conditions"""
    base = f"Format: {fmt}\n"
    sample_str = "\n".join([f"Input: {s.input} => Output: {s.output}" for s in samples])
    cond_str = f"Conditions: {conditions}" if conditions else ""
    return f"{base}{sample_str}\n{cond_str}"

def generate_test_cases(prompt: str) -> List[TestCase]:
    """Generate test cases for the given prompt"""
    test_cases = []
    for i in range(5):
        expected = f"Expected output {i}"
        actual = expected if random.random() > 0.3 else f"Wrong output {i}"
        test_cases.append(
            TestCase(
                input=f"Test input {i}",
                expected_output=expected,
                actual_output=actual,
                is_correct=actual == expected,
                similarity_score=1.0 if actual == expected else random.uniform(0.5, 0.7)
            )
        )
    return test_cases

def evaluate_prompt(prompt: str, test_cases: List[TestCase]) -> Tuple[float, float]:
    """Evaluate the prompt using test cases"""
    start = time.time()
    correct_cases = sum(1 for tc in test_cases if tc.is_correct)
    accuracy = correct_cases / len(test_cases)
    response_time = time.time() - start
    return accuracy, response_time

def update_prompt(current_prompt: str, test_cases: List[TestCase], accuracy: float) -> str:
    """Update prompt based on evaluation results"""
    # In a real implementation, this would use ML to improve the prompt
    return current_prompt + f"\n[Updated based on accuracy: {accuracy:.2f}]" 