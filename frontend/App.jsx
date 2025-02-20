import React, { useState, useEffect, useCallback } from "react";
import { FiCopy, FiSun, FiMoon, FiSave, FiTrash2, FiEdit2 } from "react-icons/fi";
import { debounce } from "lodash";

const PromptInterface = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt");
  const [jsonInput, setJsonInput] = useState("");
  const [samplesInput, setSamplesInput] = useState({
    input1: "",
    output1: "",
    input2: "",
    output2: "",
    input3: "",
    output3: ""
  });
  const [guidelines, setGuidelines] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState(null);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const debouncedInputChange = useCallback(
    debounce((value, setter) => {
      setter(value);
    }, 300),
    []
  );

  const handleGeneratePrompt = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratedPrompt("Sample generated prompt based on inputs...");
      setTestCases(["Test Case 1", "Test Case 2"]);
    } catch (error) {
      console.error("Error generating prompt:", error);
    }
    setLoading(false);
  };

  const handleRegeneratePrompt = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonInput,
          samplesInput,
          guidelines
        })
      });
      const data = await response.json();
      setGeneratedPrompt(data.prompt);
      setTestCases(data.testCases || []);
    } catch (error) {
      console.error("Error regenerating prompt:", error);
    }
    setLoading(false);
  };

  const handleRunPrompt = async () => {
    if (!generatedPrompt) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/run-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: generatedPrompt,
          testCases,
          samplesInput
        })
      });
      const data = await response.json();
      setEvaluationResults(data.results);
      setActiveTab('results');
    } catch (error) {
      console.error('Error running prompt:', error);
      setEvaluationResults({ error: 'Failed to run prompt' });
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Prompt Generation Interface</h1>
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">JSON Configuration</h2>
              <textarea
                className="w-full h-48 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter JSON configuration..."
                onChange={(e) => debouncedInputChange(e.target.value, setJsonInput)}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Samples Input/Output</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Input {index}</label>
                      <textarea
                        className="w-full h-24 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder={`Enter input sample ${index}...`}
                        onChange={(e) => {
                          const newSamplesInput = { ...samplesInput };
                          newSamplesInput[`input${index}`] = e.target.value;
                          debouncedInputChange(newSamplesInput, setSamplesInput);
                        }}
                        value={samplesInput[`input${index}`] || ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Output {index}</label>
                      <textarea
                        className="w-full h-24 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        placeholder={`Enter output sample ${index}...`}
                        onChange={(e) => {
                          const newSamplesInput = { ...samplesInput };
                          newSamplesInput[`output${index}`] = e.target.value;
                          debouncedInputChange(newSamplesInput, setSamplesInput);
                        }}
                        value={samplesInput[`output${index}`] || ""}
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => {
                    if (Object.keys(samplesInput).length / 2 < 5) {
                      const newIndex = Object.keys(samplesInput).length / 2 + 1;
                      setSamplesInput({
                        ...samplesInput,
                        [`input${newIndex}`]: "",
                        [`output${newIndex}`]: ""
                      });
                    }
                  }}
                  disabled={Object.keys(samplesInput).length >= 10}
                >
                  Add Sample Pair
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
              <textarea
                className="w-full h-48 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter guidelines..."
                onChange={(e) => debouncedInputChange(e.target.value, setGuidelines)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === "prompt" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => setActiveTab("prompt")}
                >
                  Generated Prompt
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === "tests" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => setActiveTab("tests")}
                >
                  Test Cases
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === "results" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                  onClick={() => setActiveTab("results")}
                >
                  Results
                </button>
              </div>

              <div className="min-h-[400px] bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {activeTab === "prompt" && (
                  <div className="relative">
                    <textarea
                      className="w-full h-96 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      value={generatedPrompt}
                      readOnly
                    />
                    <button
                      onClick={() => copyToClipboard(generatedPrompt)}
                      className="absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiCopy className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {activeTab === "tests" && (
                  <div className="space-y-4">
                    {testCases.map((test, index) => (
                      <div key={index} className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Test Case {index + 1}</h3>
                          <div className="flex space-x-2">
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">Input:</label>
                            <textarea
                              className="w-full h-24 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              value={test.input || test}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">Expected Output:</label>
                            <textarea
                              className="w-full h-24 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                              value={test.output || ""}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "results" && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(evaluationResults, null, 2) || "No results yet"}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleGeneratePrompt}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? "Generating..." : "Generate Prompt & Test Cases"}
              </button>
              <button
                onClick={handleRegeneratePrompt}
                disabled={loading || !generatedPrompt}
                className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
              >
                Generate Prompt Again
              </button>
              <button
                onClick={handleRunPrompt}
                disabled={!generatedPrompt || loading}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? "Running..." : "Run Prompt"}
              </button>
              <button
                onClick={() => {}}
                disabled={!generatedPrompt}
                className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
              >
                Evaluate Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInterface;