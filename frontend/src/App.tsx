import { useState } from 'react'
import axios from 'axios'

interface Sample {
  input: string
  output: string
}

interface TestCase {
  input: string
  expected_output: string
  actual_output: string
  is_correct: boolean
}

function App() {
  const [format, setFormat] = useState('')
  const [samples, setSamples] = useState<Sample[]>([{ input: '', output: '' }])
  const [conditions, setConditions] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [accuracy, setAccuracy] = useState(0)

  const handleAddSample = () => {
    setSamples([...samples, { input: '', output: '' }])
  }

  const handleSampleChange = (index: number, field: 'input' | 'output', value: string) => {
    const newSamples = [...samples]
    newSamples[index][field] = value
    setSamples(newSamples)
  }

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:25043/api/generate-prompt', {
        format,
        samples,
        conditions,
      })
      
      setGeneratedPrompt(response.data.generated_prompt)
      setTestCases(response.data.test_cases)
      setAccuracy(response.data.accuracy)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auto Prompting Tool</h1>
      
      <div className="mb-4">
        <label className="block mb-2">Prompt Format:</label>
        <textarea
          className="w-full p-2 border rounded"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Samples:</label>
        {samples.map((sample, index) => (
          <div key={index} className="mb-2">
            <input
              className="mr-2 p-2 border rounded"
              placeholder="Input"
              value={sample.input}
              onChange={(e) => handleSampleChange(index, 'input', e.target.value)}
            />
            <input
              className="p-2 border rounded"
              placeholder="Output"
              value={sample.output}
              onChange={(e) => handleSampleChange(index, 'output', e.target.value)}
            />
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddSample}
        >
          Add Sample
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-2">Additional Conditions:</label>
        <textarea
          className="w-full p-2 border rounded"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
      </div>

      <button
        className="bg-green-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Generate Prompt
      </button>

      {generatedPrompt && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Generated Prompt:</h2>
          <pre className="p-4 bg-gray-100 rounded">{generatedPrompt}</pre>
          <p className="mt-2">Accuracy: {(accuracy * 100).toFixed(2)}%</p>
        </div>
      )}

      {testCases.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Test Cases:</h2>
          <div className="grid gap-4">
            {testCases.map((test, index) => (
              <div key={index} className={`p-4 rounded ${test.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>Input:</strong> {test.input}</p>
                <p><strong>Expected:</strong> {test.expected_output}</p>
                <p><strong>Actual:</strong> {test.actual_output}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App 