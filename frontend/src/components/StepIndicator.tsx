import React from 'react';
import { FiChevronRight, FiCheck } from "react-icons/fi";

interface StepIndicatorProps {
  step: number;
  title: string;
  active: boolean;
  completed: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  step, 
  title, 
  active, 
  completed 
}) => (
  <div className="flex items-center">
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
      ${active ? 'border-blue-600 text-blue-600' : 
        completed ? 'border-green-500 bg-green-500 text-white' : 
        'border-gray-300 text-gray-300'}`}
    >
      {completed ? <FiCheck /> : step}
    </div>
    <span className={`ml-2 text-sm font-medium ${
      active ? 'text-blue-600' : 
      completed ? 'text-green-500' : 
      'text-gray-500'
    }`}>
      {step === 1 && "Generate Prompt & Test Cases"}
      {step === 2 && "Run Prompt"}
      {step === 3 && "Evaluation"}
    </span>
    {step < 3 && <FiChevronRight className="mx-4" />}
  </div>
); 