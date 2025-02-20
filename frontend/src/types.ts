export interface InputOutputRow {
  input: string;
  output: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
  prompt_output: string;
  is_correct: boolean;
  similarity_score: number;
}

export interface GenerateResponse {
  generated_prompt: string;
  test_cases: TestCase[];
  total_time: number;
}

export interface RunPromptResponse {
  test_cases: TestCase[];
  total_time: number;
}

export interface EvaluationResult {
  accuracy: number;
  avg_similarity: number;
  test_cases: TestCase[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
} 