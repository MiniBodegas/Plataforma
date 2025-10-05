import React from 'react';

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number
                  ? "bg-[#4B799B] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step.completed ? "✓" : step.number}
            </div>
            <div 
              className={`mt-2 text-xs text-center w-full ${
                currentStep === step.number 
                  ? "text-[#4B799B] font-medium" 
                  : "text-gray-500"
              }`}
            >
              {step.title}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-20 mx-2 self-center ${
                  currentStep > step.number ? "bg-[#4B799B]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#2C3A61]">
          {steps[currentStep - 1]?.title}
        </h3>
      </div>
    </div>
  );
}