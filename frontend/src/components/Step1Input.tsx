/**
 * @author DoanNgocCuong
 * @github https://github.com/DoanNgocCuong
 */

import React from 'react';
import { FiTrash2 } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { InputOutputRow } from '../types';
import authorImage from '../assets/cuong.png';

interface Step1Props {
  jsonInput: string;
  inputOutputRows: InputOutputRow[];
  conditions: string;
  testCases: number;
  loading: boolean;
  error: string | null;
  onJsonInputChange: (value: string) => void;
  onInputOutputChange: (
    e: React.ChangeEvent<HTMLInputElement>, 
    index: number, 
    field: 'input' | 'output'
  ) => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onConditionsChange: (value: string) => void;
  onTestCasesChange: (value: number) => void;
  onNext: () => void;
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
  onNext
}) => {
  return (
    <div className="space-y-6">
      {/* Author info */}
      <div className="flex justify-end items-center text-sm text-gray-500 mb-2">
        <a 
          href="https://github.com/DoanNgocCuong" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-blue-600"
        >
          <img 
            src={authorImage} 
            alt="DoanNgocCuong" 
            className="w-8 h-8 rounded-full mr-2 border-2 border-gray-200"
          />
          <span>Developed by DoanNgocCuong</span>
          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>

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

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={loading}
          className={`px-6 py-2 rounded-md ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
            'Next'
          )}
        </button>
      </div>
    </div>
  );
}; 