import { useState } from "react";
import { ExtraServices } from "./ExtraServices";

export function FormStepper({ onDataChange, reservationData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    numeroCelular: '',
    fechaInicio: '',
    servicios: [],
    ...reservationData
  });

  const handleFormChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    if (onDataChange) {
      onDataChange(field, value);
    }
  };

  const handleInputChange = (field) => (event) => {
    handleFormChange(field, event.target.value);
  };

  const handleFechaChange = (event) => {
    const fecha = event.target.value;
    handleFormChange('fechaInicio', fecha);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Solo 3 pasos ahora
  const steps = [
    { number: 1, title: "Información Personal", completed: currentStep > 1 },
    { number: 2, title: "Fecha de Inicio", completed: currentStep > 2 },
    { number: 3, title: "Servicios Adicionales", completed: currentStep > 3 },
  ];

  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'NIT', label: 'NIT (Persona Jurídica)' }
  ];

  return (
    <div className="bg-white dark:bg-white rounded-lg shadow-lg p-6">
      {/* Progress Steps con títulos */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-[#4B799B] text-white"
                    : "bg-gray-200 dark:bg-gray-200 text-gray-600 dark:text-gray-600"
                }`}
              >
                {step.completed ? "✓" : step.number}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-20 mx-2 ${
                    currentStep > step.number ? "bg-[#4B799B]" : "bg-gray-200 dark:bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Títulos de los pasos */}
        <div className="flex justify-between text-xs">
          {steps.map((step) => (
            <div 
              key={step.number} 
              className={`text-center flex-1 ${
                currentStep === step.number 
                  ? "text-[#4B799B] font-medium" 
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[#2C3A61] dark:text-[#2C3A61]">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <div>
            <p className="text-sm text-[#2C3A61] dark:text-[#2C3A61] mb-4">
              Completa tu información personal para continuar:
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61] dark:text-[#2C3A61]">
                  Tipo de documento
                </label>
                <select
                  value={formData.tipoDocumento}
                  onChange={handleInputChange('tipoDocumento')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                >
                  <option value="">Selecciona un tipo de documento</option>
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo.value} value={tipo.value} className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61] dark:text-[#2C3A61]">
                  Número de documento
                </label>
                <input
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={handleInputChange('numeroDocumento')}
                  placeholder="Ingresa tu número de documento"
                  className="w-full p-3 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61] dark:text-[#2C3A61]">
                  Número de celular
                </label>
                <input
                  type="tel"
                  value={formData.numeroCelular}
                  onChange={handleInputChange('numeroCelular')}
                  placeholder="Ej: 3001234567"
                  className="w-full p-3 border border-gray-300 dark:border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-white text-gray-900 dark:text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#2C3A61] dark:text-[#2C3A61]">
                  Selecciona la fecha de inicio:
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={handleFechaChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <ExtraServices 
              data={formData} 
              onChange={handleFormChange}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`px-4 py-2 rounded-md ${
            currentStep === 1
              ? "bg-gray-200 dark:bg-gray-200 text-gray-400 dark:text-gray-400 cursor-not-allowed"
              : "bg-gray-300 dark:bg-gray-300 text-gray-700 dark:text-gray-700 hover:bg-gray-400 dark:hover:bg-gray-400"
          }`}
        >
          Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === 3}
          className={`px-4 py-2 rounded-md ${
            currentStep === 3
              ? "text-white hover:opacity-90 transition-opacity"
              : "bg-[#4B799B] text-white hover:bg-[#3b5f7a]"
          }`}
          style={{
            backgroundColor: currentStep === 3 ? "#4B799B" : undefined
          }}
          onMouseEnter={(e) => {
            if (currentStep === 3) {
              e.target.style.backgroundColor = "#1e2a4a";
            }
          }}
          onMouseLeave={(e) => {
            if (currentStep === 3) {
              e.target.style.backgroundColor = "#4B799B";
            }
          }}
        >
          {currentStep === 3 ? "Completar Formulario" : "Siguiente"}
        </button>
      </div>
    </div>
  );  
}