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
  <div className={`flex items-center ${completed ? "text-green-500" : active ? "text-blue-600" : "text-gray-400"}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
      ${completed ? "border-green-500 bg-green-50" : active ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
      {completed ? <FiCheck /> : step}
    </div>
    <span className="ml-2 font-medium">{title}</span>
    {step < 3 && <FiChevronRight className="mx-4" />}
  </div>
); 