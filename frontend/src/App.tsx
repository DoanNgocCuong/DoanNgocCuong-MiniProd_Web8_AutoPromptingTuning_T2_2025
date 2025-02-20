import React, { useState, useMemo } from "react";
import { FiChevronRight, FiTrash2, FiCheck } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Types
interface InputOutputRow {
  input: string;
  output: string;
}

interface EvaluationResult {
  successRate: number;
  passed: number;
  failed: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Add this interface for API responses
interface GenerateResponse {
  success: boolean;
  data: any;
  message?: string;
}

// API Service
const API_BASE_URL = 'http://103.253.20.13:25043/api';

const apiService = {
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      console.log('Sending request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request data:', data);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response data:', result);
      return { data: result };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }
};

// Components
interface StepIndicatorProps {
  step: number;
  title: string;
  active: boolean;
  completed: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, title, active, completed }) => (
  <div className={`flex items-center ${completed ? "text-green-500" : active ? "text-blue-600" : "text-gray-400"}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
      ${completed ? "border-green-500 bg-green-50" : active ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
      {completed ? <FiCheck /> : step}
    </div>
    <span className="ml-2 font-medium">{title}</span>
    {step < 3 && <FiChevronRight className="mx-4" />}
  </div>
);

// Main Component
const PromptTool: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [jsonInput, setJsonInput] = useState<string>("");
  const [inputOutputRows, setInputOutputRows] = useState<InputOutputRow[]>([{ input: "", output: "" }]);
  const [conditions, setConditions] = useState<string>("");
  const [testCases, setTestCases] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

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

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!jsonInput.trim()) {
        throw new Error('JSON input is required');
      }

      // Validate input-output examples
      if (!inputOutputRows.some(row => row.input && row.output)) {
        throw new Error('At least one complete input-output example is required');
      }

      const response = await apiService.post<GenerateResponse>('/run-prompt', {
        jsonInput,
        inputOutputRows: inputOutputRows.filter(row => row.input && row.output),
        conditions,
        testCases
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setResults(response.data);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      // Keep the user on the current step when there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.post<EvaluationResult>('/evaluate-results', {
        results,
        inputOutputRows
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setEvaluation(response.data || null);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setCurrentStep(currentStep - 1);

  // Memoized chart data
  const chartData = useMemo(() => ({
    labels: ["Passed", "Failed"],
    datasets: [{
      data: evaluation ? [evaluation.passed, evaluation.failed] : [0, 0],
      backgroundColor: ["#4ade80", "#f87171"],
      borderWidth: 0
    }]
  }), [evaluation]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <StepIndicator step={1} title="Input" active={currentStep === 1} completed={currentStep > 1} />
            <StepIndicator step={2} title="Execution" active={currentStep === 2} completed={currentStep > 2} />
            <StepIndicator step={3} title="Evaluation" active={currentStep === 3} completed={currentStep > 3} />
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">JSON Input</h2>
              <textarea
                className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter JSON format here"
                value={jsonInput}
                onChange={handleTextAreaChange}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Input-Output Examples</h2>
              <div className="space-y-4">
                {inputOutputRows.map((row, index) => (
                  <div key={index} className="flex space-x-4">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md"
                      placeholder="Input"
                      value={row.input}
                      onChange={(e) => handleInputChange(e, index, "input")}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md"
                      placeholder="Output"
                      value={row.output}
                      onChange={(e) => handleInputChange(e, index, "output")}
                    />
                    <button
                      onClick={() => deleteRow(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRow}
                  className="mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  + Add Row
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Conditions</h2>
              <textarea
                className="w-full h-32 p-3 border rounded-md"
                placeholder="Enter specific requirements..."
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
            </div>

            {/* Add error display */}
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !jsonInput.trim()}
                className={`px-6 py-2 rounded-md flex items-center space-x-2 ${
                  loading || !jsonInput.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                ) : null}
                <span>Generate</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Execution</h2>
            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center space-x-2"
              >
                Back
              </button>
              <button
                onClick={handleEvaluate}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                {loading && <AiOutlineLoading3Quarters className="animate-spin mr-2" />}
                Evaluate Results
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && evaluation && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Evaluation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{evaluation.successRate}%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-2xl font-semibold text-green-500">{evaluation.passed}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <div className="text-2xl font-semibold text-red-500">{evaluation.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
              <div className="w-full h-64">
                <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center space-x-2"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTool;