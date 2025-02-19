from typing import List
from models import PromptTestCase
from run_prompt import PromptRunner
import logging

logger = logging.getLogger(__name__)

class PromptTestRunner(PromptRunner):
    def run_with_testcases(self, prompt: str, test_cases: List[PromptTestCase]) -> List[PromptTestCase]:
        """Chạy prompt với test cases có sẵn"""
        logger.info(f"Running prompt with {len(test_cases)} test cases")
        
        for test_case in test_cases:
            # Chạy prompt với input của test case
            output = self.run_single_prompt(prompt, test_case.input)
            
            # Cập nhật output vào test case
            test_case.prompt_output = output
            
            logger.info(f"""
                Test case run:
                Input: {test_case.input}
                Output: {output}
            """)
            
        return test_cases 