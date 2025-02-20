import React, { useState, useEffect } from 'react';
import { TestCase } from '../types';

interface Step2Props {
  prompt: string;
  testCases: TestCase[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onRunPrompt: () => void;
  onPromptEdit: (newPrompt: string) => void;
  onTestCaseEdit: (index: number, updatedTestCase: TestCase) => void;
  onTestCaseAdd: () => void;
  onTestCaseDelete: (index: number) => void;
}

export const Step2Results: React.FC<Step2Props> = ({
  prompt,
  testCases,
  loading,
  error,
  onBack,
  onRunPrompt,
  onPromptEdit,
  onTestCaseEdit,
  onTestCaseAdd,
  onTestCaseDelete
}) => {
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  // Move console logs to useEffect
  useEffect(() => {
    console.log('Current prompt value:', prompt);
    console.log('Current editedPrompt value:', editedPrompt);
  }, [prompt, editedPrompt]);

  const handlePromptSave = () => {
    console.log('Saving new prompt:', editedPrompt);
    onPromptEdit(editedPrompt);
    setIsEditingPrompt(false);
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
              {prompt}
            </pre>
          </div>
        )}
      </div>

      {/* Test Cases Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium">Generated Test Cases</h3>
          <button
            onClick={onTestCaseAdd}
            className="text-blue-600 hover:text-blue-700"
          >
            + Add Test Case
          </button>
        </div>
        <div className="space-y-4">
          {testCases.map((testCase, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Input</h4>
                  <input
                    type="text"
                    className="mt-1 w-full p-2 border rounded-md"
                    value={testCase.input}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, input: e.target.value })}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Expected Output</h4>
                  <input
                    type="text"
                    className="mt-1 w-full p-2 border rounded-md"
                    value={testCase.expected_output}
                    onChange={(e) => onTestCaseEdit(index, { ...testCase, expected_output: e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => onTestCaseDelete(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          } text-white flex items-center`}
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
            'Run Prompt'
          )}
        </button>
      </div>
    </div>
  );
}; 