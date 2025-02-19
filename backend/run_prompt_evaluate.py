from typing import List, Dict
from models import PromptTestCase, EvaluationResult
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)

class PromptEvaluator:
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Tính độ tương đồng giữa 2 text"""
        if text1 == text2:
            return 1.0
        return SequenceMatcher(None, text1, text2).ratio()

    def evaluate_testcases(self, test_cases: List[PromptTestCase]) -> EvaluationResult:
        """Đánh giá kết quả test cases"""
        total_cases = len(test_cases)
        correct_cases = 0
        total_similarity = 0.0
        
        for test_case in test_cases:
            # Tính similarity
            similarity = self.calculate_similarity(
                test_case.prompt_output,
                test_case.expected_output
            )
            
            # Cập nhật test case
            test_case.similarity_score = similarity
            test_case.is_correct = similarity > 0.95
            
            if test_case.is_correct:
                correct_cases += 1
            total_similarity += similarity
            
            logger.info(f"""
                Evaluation results:
                Input: {test_case.input}
                Expected: {test_case.expected_output}
                Got: {test_case.prompt_output}
                Similarity: {similarity:.2f}
                Correct: {test_case.is_correct}
            """)
        
        return EvaluationResult(
            accuracy=correct_cases / total_cases,
            avg_similarity=total_similarity / total_cases,
            test_cases=test_cases
        ) 