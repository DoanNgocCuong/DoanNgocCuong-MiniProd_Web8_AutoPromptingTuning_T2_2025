import React from 'react';
import { FiTrash2 } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { InputOutputRow } from '../types';

interface Step1Props {
  jsonInput: string;
  inputOutputRows: InputOutputRow[];
  conditions: string;
  testCases: number;
  loading: boolean;
  error: string | null;
  onJsonInputChange: (value: string) => void;
  onInputOutputChange: (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof InputOutputRow) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onConditionsChange: (value: string) => void;
  onTestCasesChange: (value: number) => void;
  onGenerate: () => void;
}

export const Step1Input: React.FC<Step1Props> = ({
  jsonInput,
  inputOutputRows,
  conditions,
  testCases,
  loading,
  error,
  onJsonInputChange,
  onInputOutputChange,
  onAddRow,
  onDeleteRow,
  onConditionsChange,
  onTestCasesChange,
  onGenerate
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">JSON Input</h2>
        <textarea
          className="w-full h-40 p-3 border rounded-md"
          placeholder="Enter JSON format here"
          value={jsonInput}
          onChange={(e) => onJsonInputChange(e.target.value)}
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
                onChange={(e) => onInputOutputChange(e, index, "input")}
              />
              <input
                type="text"
                className="flex-1 p-2 border rounded-md"
                placeholder="Output"
                value={row.output}
                onChange={(e) => onInputOutputChange(e, index, "output")}
              />
              <button
                onClick={() => onDeleteRow(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button
            onClick={onAddRow}
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
          onChange={(e) => onConditionsChange(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Test Cases</h2>
        <input
          type="number"
          min="1"
          max="10"
          className="w-full p-3 border rounded-md"
          value={testCases}
          onChange={(e) => onTestCasesChange(Number(e.target.value))}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={onGenerate}
          disabled={loading || !jsonInput.trim()}
          className={`px-6 py-2 rounded-md flex items-center space-x-2 ${
            loading || !jsonInput.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading && <AiOutlineLoading3Quarters className="animate-spin mr-2" />}
          <span>Generate</span>
        </button>
      </div>
    </div>
  );
}; 