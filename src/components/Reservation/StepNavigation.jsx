import React from 'react';

export function StepNavigation({ 
  currentStep, 
  totalSteps, 
  prevStep, 
  nextStep, 
  isLastStep, 
  onConfirm,
  isProcessing
}) {
  return (
    <div className="flex justify-between">
      <button
        onClick={prevStep}
        disabled={currentStep === 1}
        className={`px-4 py-2 rounded-md ${
          currentStep === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-300 text-gray-700 hover:bg-gray-400"
        }`}
      >
        Anterior
      </button>

      {isLastStep ? (
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="px-6 py-2 bg-[#2C3A61] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creando reserva...
            </>
          ) : (
            <>
              🎉 Confirmar Reserva
            </>
          )}
        </button>
      ) : (
        <button
          onClick={nextStep}
          className="px-4 py-2 bg-[#4B799B] text-white rounded-md hover:bg-[#3b5f7a] transition"
        >
          Siguiente
        </button>
      )}
    </div>
  );
}