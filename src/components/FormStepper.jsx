import { useState } from "react";
import { Stepper,FormStep } from "./index";

export function FormStepper() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Datos enviados: " + JSON.stringify(formData));
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-4">
      <Stepper step={step} />
      <FormStep step={step} onChange={handleChange} data={formData} />

      <div className="flex justify-between mt-4">
        {step > 1 && (
          <button onClick={prevStep} className="bg-gray-300 px-4 py-2 rounded">
            Atrás
          </button>
        )}
        {step < 3 ? (
          <button onClick={nextStep} className="bg-blue-500 text-white px-4 py-2 rounded">
            Siguiente
          </button>
        ) : (
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
            Enviar
          </button>
        )}
      </div>
    </div>
  );
}
