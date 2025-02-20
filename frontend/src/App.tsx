import React, { useState, useMemo, useCallback } from "react";
import { FiChevronRight, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { BiRefresh } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PromptTool = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jsonInput, setJsonInput] = useState("");
  const [inputOutputRows, setInputOutputRows] = useState([{ input: "", output: "" }]);
  const [conditions, setConditions] = useState("");
  const [testCases, setTestCases] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const addRow = () => {
    setInputOutputRows([...inputOutputRows, { input: "", output: "" }]);
  };

  const deleteRow = (index) => {
    const newRows = inputOutputRows.filter((_, i) => i !== index);
    setInputOutputRows(newRows);
  };

  const updateRow = (index, field, value) => {
    const newRows = [...inputOutputRows];
    newRows[index][field] = value;
    setInputOutputRows(newRows);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/run-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonInput,
          inputOutputRows,
          conditions,
          testCases
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setResults(data);
      setCurrentStep(2);
    } catch (error) {
      console.error("Generation failed:", error);
    }
    setLoading(false);
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/evaluate-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          results,
          inputOutputRows
        })
      });
      const evaluationData = await response.json();
      if (!response.ok) throw new Error(evaluationData.message);
      setEvaluation(evaluationData);
      setCurrentStep(3);
    } catch (error) {
      console.error("Evaluation failed:", error);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const chartData = useMemo(() => ({
    labels: ["Passed", "Failed"],
    datasets: [{
      data: evaluation ? [evaluation.passed, evaluation.failed] : [0, 0],
      backgroundColor: ["#4ade80", "#f87171"],
      borderWidth: 0
    }]
  }), [evaluation]);

  const StepIndicator = ({ step, title, active, completed }) => (
    <div className={`flex items-center ${completed ? "text-green-500" : active ? "text-blue-600" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${completed ? "border-green-500 bg-green-50" : active ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
        {completed ? <FiCheck /> : step}
      </div>
      <span className="ml-2 font-medium">{title}</span>
      {step < 3 && <FiChevronRight className="mx-4" />}
    </div>
  );

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
                onChange={(e) => setJsonInput(e.target.value)}
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
                      onChange={(e) => updateRow(index, "input", e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded-md"
                      placeholder="Output"
                      value={row.output}
                      onChange={(e) => updateRow(index, "output", e.target.value)}
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

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
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