import React, { useState, useMemo, useEffect } from "react";
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
import { toast } from "react-hot-toast";

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
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Xử lý error message từ API
        throw new Error(responseData.detail || JSON.stringify(responseData));
      }

      return responseData;
    } catch (error) {
      // Log error chi tiết để debug
      console.error('API Error:', error);
      throw error;
    }
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

  // Monitor state changes
  useEffect(() => {
    console.log('State updated:', {
      currentStep,
      generatedPrompt,
      promptTestCases
    });
  }, [currentStep, generatedPrompt, promptTestCases]);

  // Reset states when needed
  const resetStates = () => {
    setGeneratedPrompt('');
    setPromptTestCases([]);
    setError(null);
  };

  // Use in handleBack if needed
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        resetStates();
      }
    }
  };

  // Handlers
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    index: number, 
    field: 'input' | 'output' // Chỉ định rõ các field được phép
  ) => {
    const newRows = [...inputOutputRows];
    newRows[index] = {
      ...newRows[index],
      [field]: e.target.value
    };
    setInputOutputRows(newRows);
  };

  const addRow = () => setInputOutputRows([...inputOutputRows, { input: "", output: "" }]);

  const deleteRow = (index: number) => {
    if (inputOutputRows.length > 1) {
      setInputOutputRows(inputOutputRows.filter((_, i) => i !== index));
    }
  };

  // Chuyển sang Step 2
  const handleNext = () => {
    setCurrentStep(2);
    
    // Thêm input-output examples vào test cases
    const exampleTestCases: TestCase[] = inputOutputRows.map(row => ({
      model: 'GPT-4', // default model
      input: row.input,
      expected_output: row.output,
      prompt_output: '',
      is_correct: false,
      similarity_score: 0,
      system_prompt: '',
      conversation_history: ''
    }));

    // Khi API trả về response, thêm example test cases vào
    const generatePrompt = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.post<GenerateResponse>('/generate-prompt-and-testcases', {
          format: jsonInput.trim(),
          samples: inputOutputRows.filter(row => row.input && row.output),
          conditions: conditions.trim(),
          num_test_cases: testCases
        });

        if (!response.generated_prompt || !response.test_cases?.length) {
          throw new Error('Invalid or empty response from server');
        }

        setGeneratedPrompt(response.generated_prompt);
        // Combine example test cases with generated test cases
        setPromptTestCases([...exampleTestCases, ...response.test_cases]);

      } catch (err) {
        console.error('Generate error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate prompt');
        setCurrentStep(1); // Quay lại Step 1 nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    generatePrompt();
  };

  // Step 2: Run Prompt
  const handleRunPrompt = async () => {
    setLoading(true);
    setError(null);

    try {
      // Chuẩn bị test cases theo đúng format API yêu cầu
      const formattedTestCases = promptTestCases.map(tc => ({
        input: tc.input,
        expected_output: tc.expected_output,
        model: tc.model || 'GPT-4',
        system_prompt: tc.system_prompt || '',
        conversation_history: tc.conversation_history || '',
        // Thêm các trường bắt buộc với giá trị mặc định
        is_correct: false,
        prompt_output: '',
        similarity_score: 0
      }));

      console.log('Running prompt with data:', {
        prompt: generatedPrompt,
        test_cases: formattedTestCases
      });

      const response = await apiService.post<RunPromptResponse>('/run-prompt', {
        prompt: generatedPrompt,
        test_cases: formattedTestCases
      });

      if (!response.test_cases?.length) {
        throw new Error('No test cases in response');
      }

      // Cập nhật state với kết quả từ API
      setPromptTestCases(response.test_cases);

      // Pre-fetch evaluation
      const evalResponse = await apiService.post<EvaluationResult>('/evaluate-results', {
        test_cases: response.test_cases
      });

      setEvaluationResult(evalResponse);

    } catch (err) {
      console.error('Error in run prompt:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to run prompt';
      setError(errorMessage);
      toast.error(errorMessage); // Thêm thông báo lỗi cho người dùng
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

  // Add new handler for replacing all test cases
  const handleTestCasesReplace = (newTestCases: TestCase[]) => {
    setPromptTestCases(newTestCases);
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

  // Theo dõi thay đổi của generatedPrompt và promptTestCases
  useEffect(() => {
    if (currentStep === 2 && (!generatedPrompt || promptTestCases.length === 0)) {
      console.warn('Step 2 mounted with empty data:', {
        generatedPrompt,
        promptTestCases
      });
    }
  }, [currentStep, generatedPrompt, promptTestCases]);

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
            onNext={handleNext}
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
            setError={setError}
            onTestCasesReplace={handleTestCasesReplace}
            inputOutputRows={inputOutputRows.map(row => ({
              ...row,
              response_time: 0 // Thêm default response_time
            }))}
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