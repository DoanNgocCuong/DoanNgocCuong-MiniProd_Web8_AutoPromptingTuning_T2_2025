/**
 * @author DoanNgocCuong
 * @github https://github.com/DoanNgocCuong
 */

import React from 'react';
import { Doughnut } from "react-chartjs-2";
import { EvaluationResult, TestCase, PromptOutput } from '../types';
import { FiPlay } from "react-icons/fi";
import authorImage from '../assets/cuong.png';

interface Step3Props {
  evaluationResult: EvaluationResult;
  testCases: TestCase[];
  onBack: () => void;
  onEvaluate: () => void;
  loading: boolean;
}

const getPromptOutput = (testCase: TestCase): string => {
  if (!testCase.prompt_output) return "";
  if (typeof testCase.prompt_output === "string") return testCase.prompt_output;
  return testCase.prompt_output.output;
};

export const Step3Evaluation: React.FC<Step3Props> = ({
  evaluationResult,
  testCases,
  onBack,
  onEvaluate,
  loading
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
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

      <h2 className="text-lg font-semibold mb-4">Evaluation Results</h2>

      {/* Test Cases Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Output</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Output</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testCases.map((testCase, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{testCase.input}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{testCase.expected_output}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getPromptOutput(testCase)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {testCase.is_correct ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Passed
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evaluation Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={onEvaluate}
          disabled={loading}
          className={`px-6 py-2 ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md flex items-center`}
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
              <FiPlay className="mr-2" />
              Run Evaluation
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {evaluationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="w-48 h-48 mx-auto">
              <Doughnut
                data={{
                  labels: ["Passed", "Failed"],
                  datasets: [{
                    data: [
                      evaluationResult.test_cases.filter(tc => tc.is_correct).length,
                      evaluationResult.test_cases.filter(tc => !tc.is_correct).length
                    ],
                    backgroundColor: ["#4ade80", "#f87171"],
                    borderWidth: 0
                  }]
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Accuracy</h3>
              <p className="text-2xl font-semibold">
                {(evaluationResult.accuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Average Similarity</h3>
              <p className="text-2xl font-semibold">
                {(evaluationResult.avg_similarity * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back
        </button>
      </div>
    </div>
  );
}; 