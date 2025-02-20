import React, { useState, useMemo } from "react";
import { FiChevronRight, FiTrash2, FiCheck } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Step1Input } from './components/Step1Input';
import { Step2Results } from './components/Step2Results';
import { Step3Evaluation } from './components/Step3Evaluation';
import { StepIndicator } from './components/StepIndicator';
import { 
  TestCase, 
  PromptOutput,
  GenerateResponse,
  RunPromptResponse,
  EvaluationResult,
  ApiResponse
} from './types';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Types and Interfaces
interface InputOutputRow {
  input: string;
  output: string;
}

// Add interface for request data
interface PromptRequest {
  prompt: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  conditions: string;
  test_cases: number;
}

// API Service
const API_BASE_URL = 'http://103.253.20.13:25043/api';

const apiService = {
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
  }
};

// Main Component
const PromptTool: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [jsonInput, setJsonInput] = useState<string>(
    'Input: "CHECK GRAMMAR"\n' +
    'Output: "{corrected_text}"\n\n' +
    'Example:\n' +
    'Input: "This is a sentnce with an error."\n' +
    'Output: "This is a sentence with an error."'
  );
  const [inputOutputRows, setInputOutputRows] = useState<InputOutputRow[]>([
    { 
      input: "This is a sentnce with an error.", 
      output: "This is a sentence with an error." 
    },
    { 
      input: "He go to the store.",
      output: "He goes to the store."
    },
    {
      input: "She dont like apples.",
      output: "She doesn't like apples."
    }
  ]);
  const [conditions, setConditions] = useState<string>(
    "1. Correct all grammatical errors.\n" +
    "2. Maintain the original meaning of the sentence.\n" +
    "3. Provide clear and concise corrections."
  );
  const [testCases, setTestCases] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [promptTestCases, setPromptTestCases] = useState<TestCase[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // Handlers
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof InputOutputRow) => {
    const newRows = [...inputOutputRows];
    newRows[index][field] = e.target.value;
    setInputOutputRows(newRows);
  };

  const addRow = () => setInputOutputRows([...inputOutputRows, { input: "", output: "" }]);

  const deleteRow = (index: number) => {
    if (inputOutputRows.length > 1) {
      setInputOutputRows(inputOutputRows.filter((_, i) => i !== index));
    }
  };

  // Step 1: Generate Prompt and Test Cases
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post<GenerateResponse>('/generate-prompt-and-testcases', {
        format: jsonInput.trim(),
        samples: inputOutputRows.filter(row => row.input && row.output),
        conditions: conditions.trim(),
        num_test_cases: testCases
      });

      setGeneratedPrompt(response.generated_prompt);
      setPromptTestCases(response.test_cases);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Run Prompt (không tự động chuyển sang step 3)
  const handleRunPrompt = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post<RunPromptResponse>('/run-prompt', {
        prompt: generatedPrompt,
        test_cases: promptTestCases
      });

      setPromptTestCases(response.test_cases);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run prompt');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Evaluate Results
  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post<EvaluationResult>('/evaluate-results', {
        test_cases: promptTestCases
      });

      setEvaluationResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate results');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  // Add new handlers for Step 2 CRUD operations
  const handlePromptEdit = (newPrompt: string) => {
    setGeneratedPrompt(newPrompt);
  };

  const handleTestCaseEdit = (index: number, updatedTestCase: TestCase) => {
    const newTestCases = [...promptTestCases];
    newTestCases[index] = {
      ...updatedTestCase,
      prompt_output: updatedTestCase.prompt_output || "",
      is_correct: false,
      similarity_score: 0
    };
    setPromptTestCases(newTestCases);
  };

  const handleTestCaseAdd = () => {
    setPromptTestCases([
      ...promptTestCases,
      {
        input: "",
        expected_output: "",
        prompt_output: "",
        is_correct: false,
        similarity_score: 0
      }
    ]);
  };

  const handleTestCaseDelete = (index: number) => {
    setPromptTestCases(promptTestCases.filter((_, i) => i !== index));
  };

  // Memoized chart data
  const chartData = useMemo(() => ({
    labels: ["Passed", "Failed"],
    datasets: [{
      data: evaluationResult ? [evaluationResult.test_cases.filter(tc => tc.is_correct).length, evaluationResult.test_cases.filter(tc => !tc.is_correct).length] : [0, 0],
      backgroundColor: ["#4ade80", "#f87171"],
      borderWidth: 0
    }]
  }), [evaluationResult]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <StepIndicator step={1} title="Input" active={currentStep === 1} completed={currentStep > 1} />
            <StepIndicator step={2} title="Results" active={currentStep === 2} completed={currentStep > 2} />
            <StepIndicator step={3} title="Evaluation" active={currentStep === 3} completed={currentStep > 3} />
          </div>
        </div>

        {currentStep === 1 && (
          <Step1Input
            jsonInput={jsonInput}
            inputOutputRows={inputOutputRows}
            conditions={conditions}
            testCases={testCases}
            loading={loading}
            error={error}
            onJsonInputChange={setJsonInput}
            onInputOutputChange={handleInputChange}
            onAddRow={addRow}
            onDeleteRow={deleteRow}
            onConditionsChange={setConditions}
            onTestCasesChange={setTestCases}
            onGenerate={handleGenerate}
          />
        )}

        {currentStep === 2 && (
          <Step2Results
            generated_prompt={generatedPrompt}
            testCases={promptTestCases}
            loading={loading}
            error={error}
            onBack={handleBack}
            onRunPrompt={handleRunPrompt}
            onPromptEdit={handlePromptEdit}
            onTestCaseEdit={handleTestCaseEdit}
            onTestCaseAdd={handleTestCaseAdd}
            onTestCaseDelete={handleTestCaseDelete}
          />
        )}

        {currentStep === 3 && evaluationResult && (
          <Step3Evaluation
            evaluationResult={evaluationResult}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default PromptTool;