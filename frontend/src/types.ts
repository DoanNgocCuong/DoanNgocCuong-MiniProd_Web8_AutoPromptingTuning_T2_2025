export interface Sample {
    input: string;
    output: string;
}

export interface TestCase {
    input: string;
    expected_output: string;
    actual_output: string;
    is_correct: boolean;
    similarity_score: number;
}

export interface OptimizationHistory {
    iteration: number;
    accuracy: number;
    response_time: number;
}

export interface PromptResponse {
    generated_prompt: string;
    test_cases: TestCase[];
    accuracy: number;
    response_time: number;
    iteration: number;
    optimization_history: OptimizationHistory[];
} 