import React, { useState, useEffect, useRef } from 'react';
import { TestCase, PromptOutput } from '../types';
import { FiUpload, FiPlay, FiSquare, FiAlertCircle, FiChevronDown, FiChevronUp, FiMaximize2, FiMinimize2, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';

interface Step2Props {
  generated_prompt: string;
  testCases: TestCase[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRunPrompt: () => void;
  onPromptEdit: (newPrompt: string) => void;
  onTestCaseEdit: (index: number, updatedTestCase: TestCase) => void;
  onTestCaseAdd: () => void;
  onTestCaseDelete: (index: number) => void;
  setError: (error: string | null) => void;
  onTestCasesReplace: (testCases: TestCase[]) => void;
}

const getPromptOutput = (testCase: TestCase): string => {
  console.log('Processing test case:', testCase);
  if (!testCase.prompt_output) {
    console.log('No prompt output');
    return "";
  }
  if (typeof testCase.prompt_output === "string") {
    console.log('String prompt output:', testCase.prompt_output);
    return testCase.prompt_output;
  }
  console.log('Object prompt output:', testCase.prompt_output);
  return testCase.prompt_output.output;
};

interface ExpandableCellProps {
  content: string;
  maxHeight?: string;
  className?: string;
}

const ExpandableCell: React.FC<ExpandableCellProps> = ({ 
  content, 
  maxHeight = "100px",
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div 
        className={`${
          !isExpanded ? `max-h-[${maxHeight}]` : ''
        } overflow-auto transition-all duration-200 ${className}`}
      >
        <pre className="whitespace-pre-wrap text-sm">{content}</pre>
      </div>
      {content.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-0 right-0 p-1 text-blue-600 hover:text-blue-800 bg-white bg-opacity-90"
        >
          {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
      )}
    </div>
  );
};

// Thêm interface cho Excel data
interface ExcelTestCase {
  model?: string;
  system_prompt?: string;
  conversation_history?: string;
  input: string;
  expected_output: string;
}

export const Step2Results: React.FC<Step2Props> = ({
  generated_prompt,
  testCases,
  loading,
  error,
  onBack,
  onRunPrompt,
  onPromptEdit,
  onTestCaseEdit,
  onTestCaseAdd,
  onTestCaseDelete,
  setError,
  onTestCasesReplace
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(generated_prompt);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Move console logs to useEffect
  useEffect(() => {
    console.log('Current prompt value:', generated_prompt);
    console.log('Current editedPrompt value:', editedPrompt);
  }, [generated_prompt, editedPrompt]);

  // Add useEffect to monitor test cases changes
  useEffect(() => {
    console.log('Test cases updated:', testCases);
  }, [testCases]);

  // Log props khi component mount và khi props thay đổi
  useEffect(() => {
    console.log('Step2Results mounted/updated with props:', {
      generated_prompt,
      testCases,
      loading,
      error,
      onBack,
      onRunPrompt,
      onPromptEdit,
      onTestCaseEdit,
      onTestCaseAdd,
      onTestCaseDelete
    });
  }, [generated_prompt, testCases, loading, error, onBack, onRunPrompt, onPromptEdit, onTestCaseEdit, onTestCaseAdd, onTestCaseDelete]);

  const handlePromptSave = () => {
    console.log('Saving new prompt:', editedPrompt);
    onPromptEdit(editedPrompt);
    setIsEditingPrompt(false);
  };

  // Hàm xử lý file Excel
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelTestCase>(worksheet);

        // Validate data
        if (!jsonData.length) {
          throw new Error('No data found in Excel file');
        }

        // Convert Excel data to TestCase format
        const newTestCases: TestCase[] = jsonData.map(row => ({
          model: row.model || 'GPT-4',
          system_prompt: row.system_prompt || '',
          conversation_history: row.conversation_history || '',
          input: row.input || '',
          expected_output: row.expected_output || '',
          prompt_output: '',
          is_correct: false,
          similarity_score: 0
        }));

        // Replace all test cases at once instead of updating individually
        onTestCasesReplace(newTestCases);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Show success message
        setError(null);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setError('Failed to process Excel file. Please check the format.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the Excel file.');
    };

    reader.readAsBinaryString(file);
  };

  // Thêm hàm để tạo và download template
  const downloadTemplate = () => {
    const template: ExcelTestCase[] = [{
      model: 'GPT-4',
      system_prompt: 'Example system prompt',
      conversation_history: 'Example conversation',
      input: 'Example input',
      expected_output: 'Example output'
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
    XLSX.writeFile(wb, 'test_cases_template.xlsx');
  };

  // Thêm hàm để download test cases hiện tại
  const downloadCurrentTestCases = () => {
    const testCasesForExport = testCases.map(tc => ({
      model: tc.model || 'GPT-4',
      system_prompt: tc.system_prompt || '',
      conversation_history: tc.conversation_history || '',
      input: tc.input,
      expected_output: tc.expected_output,
      output_prompt: getPromptOutput(tc)
    }));

    const ws = XLSX.utils.json_to_sheet(testCasesForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(wb, `test_cases_${timestamp}.xlsx`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Generated Results</h2>

      {/* Prompt Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Generated Prompt</h3>
          <button
            onClick={() => {
              console.log('Toggling edit mode. Current value:', !isEditingPrompt);
              setIsEditingPrompt(!isEditingPrompt);
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            {isEditingPrompt ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingPrompt ? (
          <div className="space-y-2">
            <textarea
              className="w-full h-40 p-3 border rounded-md font-mono text-sm"
              value={editedPrompt}
              onChange={(e) => {
                console.log('Editing prompt:', e.target.value);
                setEditedPrompt(e.target.value);
              }}
            />
            <button
              onClick={handlePromptSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {generated_prompt}
            </pre>
          </div>
        )}
      </div>

      {/* Test Cases Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-md font-medium">Generated Test Cases</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
            >
              <FiUpload className="w-4 h-4" />
              <span>Upload Excel</span>
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download Template</span>
            </button>
            <button
              onClick={downloadCurrentTestCases}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export Test Cases</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </div>
          <button
            onClick={onTestCaseAdd}
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Test Case
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Prompt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversation History</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Input</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output Prompt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testCases.map((testCase, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="w-full p-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={testCase.model || "GPT-4"}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, model: e.target.value })}
                  >
                    <option value="GPT-4">GPT-4</option>
                    <option value="GPT-3">GPT-3</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <textarea
                    className="w-full p-2 border rounded-md text-sm min-h-[60px] focus:ring-blue-500 focus:border-blue-500 resize-y"
                    value={testCase.system_prompt || ""}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, system_prompt: e.target.value })}
                    placeholder="Enter system prompt"
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea
                    className="w-full p-2 border rounded-md text-sm min-h-[60px] focus:ring-blue-500 focus:border-blue-500 resize-y"
                    value={testCase.conversation_history || ""}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, conversation_history: e.target.value })}
                    placeholder="Enter conversation history"
                    rows={3}
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea
                    className="w-full p-2 border rounded-md text-sm min-h-[60px] focus:ring-blue-500 focus:border-blue-500 resize-y"
                    value={testCase.input}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, input: e.target.value })}
                    placeholder="Enter user input"
                  />
                </td>
                <td className="px-6 py-4 bg-blue-50 border-l-4 border-blue-400">
                  {testCase.prompt_output && (
                    <ExpandableCell 
                      content={getPromptOutput(testCase)}
                      className="bg-white rounded p-2 shadow-sm"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onTestCaseDelete(index)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back
        </button>
        <button
          onClick={onRunPrompt}
          disabled={loading}
          className={`px-6 py-2 rounded-md ${
            loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } text-white flex items-center space-x-2`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <FiPlay className="w-5 h-5" />
              <span>Run Prompt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}; 