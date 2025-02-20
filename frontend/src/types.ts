export interface InputOutputRow {
  input: string;
  output: string;
}

export interface PromptOutput {
  input: string;
  output: string;
  response_time: number;
}

export interface TestCase {
  input: string;
  expected_output: string;
  prompt_output: PromptOutput | string;
  is_correct: boolean;
  similarity_score: number;
  model?: string;
  system_prompt?: string;
  conversation_history?: string;
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