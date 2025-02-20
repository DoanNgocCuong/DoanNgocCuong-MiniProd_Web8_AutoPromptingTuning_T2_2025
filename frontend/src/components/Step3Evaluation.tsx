import React from 'react';
import { Doughnut } from "react-chartjs-2";
import { EvaluationResult } from '../types';

interface Step3Props {
  evaluationResult: EvaluationResult;
  onBack: () => void;
}

export const Step3Evaluation: React.FC<Step3Props> = ({
  evaluationResult,
  onBack
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Evaluation Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Test Cases Results */}
      <div className="mt-6">
        <h3 className="text-md font-medium mb-4">Test Cases Details</h3>
        <div className="space-y-4">
          {evaluationResult.test_cases.map((testCase, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Input</h4>
                  <p className="mt-1">{testCase.input}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Expected Output</h4>
                  <p className="mt-1">{testCase.expected_output}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Prompt Output</h4>
                  <p className="mt-1">{testCase.prompt_output}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Result</h4>
                  <p className={`mt-1 ${testCase.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {testCase.is_correct ? 'Passed' : 'Failed'} ({(testCase.similarity_score * 100).toFixed(1)}% similar)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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