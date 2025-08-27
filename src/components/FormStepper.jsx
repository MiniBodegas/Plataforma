import { useState } from "react";
import { Stepper, FormStep } from "./index";

export function FormStepper() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Datos enviados: " + JSON.stringify(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
        {/* Stepper */}
        <Stepper step={step} />

        {/* Formulario */}
        <div className="w-full mt-6">
          <FormStep step={step} onChange={handleChange} data={formData} />
        </div>

        {/* Botones */}
        <div className="flex justify-between w-full mt-6">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Atrás
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ml-auto"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ml-auto"
            >
              Enviar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
