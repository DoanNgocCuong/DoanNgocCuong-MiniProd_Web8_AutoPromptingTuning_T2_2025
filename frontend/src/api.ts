import axios from 'axios';
import { Sample, PromptResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generatePrompt = async (
    format: string,
    samples: Sample[],
    conditions: string
): Promise<PromptResponse> => {
    const response = await axios.post<PromptResponse>(`${API_URL}/api/generate-prompt`, {
        format,
        samples,
        conditions,
        iteration: 0
    });
    return response.data;
};

export const submitFeedback = async (prompt: string, feedback: string): Promise<void> => {
    await axios.post(`${API_URL}/api/feedback`, {
        prompt,
        feedback
    });
}; 