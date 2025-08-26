export function Stepper({ step }) {
  const steps = ["Datos de la reserva", "Servicios extras", "Pago"];

  return (
    <div className="flex justify-between items-center mb-6">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = step === stepNumber;
        const isCompleted = step > stepNumber;

        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                ${isActive ? "bg-blue-500 text-white border-blue-500" : isCompleted ? "bg-green-500 text-white border-green-500" : "border-gray-300 text-gray-400"}`}
            >
              {stepNumber}
            </div>

            <span
              className={`ml-2 text-sm font-medium ${isActive ? "text-blue-500" : isCompleted ? "text-green-500" : "text-gray-400"}`}
            >
              {label}
            </span>

            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-gray-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
