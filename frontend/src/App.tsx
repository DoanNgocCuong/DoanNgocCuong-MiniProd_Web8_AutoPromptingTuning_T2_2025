import { useState } from 'react';
import { MantineProvider, Container, Button, Textarea, Paper, Title, Grid } from '@mantine/core';
import axios from 'axios';
import { API_URL } from './config';

interface Sample {
  input: string;
  output: string;
}

interface PromptRequest {
  format: string;
  samples: Sample[];
  conditions: string;
}

// Thêm type cho event handlers
type TextAreaEvent = React.ChangeEvent<HTMLTextAreaElement>;

function App() {
  const [format, setFormat] = useState('');
  const [samples, setSamples] = useState<Sample[]>([{ input: '', output: '' }]);
  const [conditions, setConditions] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [accuracy, setAccuracy] = useState(0);

  const handleSubmit = async () => {
    try {
      const request: PromptRequest = {
        format,
        samples,
        conditions,
      };

      const response = await axios.post(`${API_URL}/api/generate-prompt`, request);
      setGeneratedPrompt(response.data.generated_prompt);
      setAccuracy(response.data.accuracy);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <MantineProvider>
      <Container size="lg" py="xl">
        <Title order={1} mb="lg">Auto Prompting Tool</Title>
        
        <Paper shadow="xs" p="md" mb="lg">
          <Title order={2} mb="md">Prompt Format</Title>
          <Textarea
            value={format}
            onChange={(e: TextAreaEvent) => setFormat(e.currentTarget.value)}
            placeholder="Enter prompt format..."
            minRows={4}
            mb="md"
          />

          <Title order={2} mb="md">Samples</Title>
          {samples.map((sample: Sample, index: number) => (
            <Grid key={index} mb="md">
              <Grid.Col span={6}>
                <Textarea
                  value={sample.input}
                  onChange={(e: TextAreaEvent) => {
                    const newSamples = [...samples];
                    newSamples[index].input = e.currentTarget.value;
                    setSamples(newSamples);
                  }}
                  placeholder="Input"
                  minRows={2}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Textarea
                  value={sample.output}
                  onChange={(e: TextAreaEvent) => {
                    const newSamples = [...samples];
                    newSamples[index].output = e.currentTarget.value;
                    setSamples(newSamples);
                  }}
                  placeholder="Output"
                  minRows={2}
                />
              </Grid.Col>
            </Grid>
          ))}
          
          <Button
            onClick={() => setSamples([...samples, { input: '', output: '' }])}
            mb="md"
          >
            Add Sample
          </Button>

          <Title order={2} mb="md">Conditions</Title>
          <Textarea
            value={conditions}
            onChange={(e: TextAreaEvent) => setConditions(e.currentTarget.value)}
            placeholder="Enter additional conditions..."
            minRows={4}
            mb="md"
          />

          <Button onClick={handleSubmit} color="blue">
            Generate Prompt
          </Button>
        </Paper>

        {generatedPrompt && (
          <Paper shadow="xs" p="md">
            <Title order={2} mb="md">Generated Prompt</Title>
            <Textarea
              value={generatedPrompt}
              readOnly
              minRows={4}
              mb="md"
            />
            <Title order={3}>Accuracy: {accuracy}%</Title>
          </Paper>
        )}
      </Container>
    </MantineProvider>
  );
}

export default App; 