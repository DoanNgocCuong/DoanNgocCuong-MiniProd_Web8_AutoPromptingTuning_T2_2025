import React, { useState, useEffect, useCallback } from "react";
import { FiCopy, FiSun, FiMoon, FiSave, FiTrash2, FiEdit2 } from "react-icons/fi";
import { debounce } from "lodash";

interface SamplesInput {
  [key: string]: string;
}

interface EvaluationResults {
  error?: string;
  [key: string]: any;
}

interface TestCase {
  input?: string;
  output?: string;
}


const PromptInterface: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "tests" | "results">("prompt");
  const [jsonInput, setJsonInput] = useState<string>("");
  const [samplesInput, setSamplesInput] = useState<SamplesInput>({
    input1: "",
    output1: "",
    input2: "",
    output2: "",
    input3: "",
    output3: ""
  });
  const [guidelines, setGuidelines] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults | null>(null);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const debouncedInputChange = useCallback(
    debounce((value: any, setter: (value: any) => void) => {
      setter(value);
    }, 300),
    []
  );

  const handleGeneratePrompt = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratedPrompt("Sample generated prompt based on inputs...");
      setTestCases([{ input: "Test Case 1" }, { input: "Test Case 2" }]);
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

  const copyToClipboard = (text: string) => {
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

        {/* Rest of your JSX implementation */}
        {/* ... */}
      </div>
    </div>
  );
};

export default PromptInterface; 