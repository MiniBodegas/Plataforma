export function Stepper({ step }) {
  const steps = ["Datos de la reserva", "Servicios extras", "Pago"];

  return (
    <div className="flex justify-center">
      <div className="flex justify-between items-center bg-white border border-gray-300 rounded-xl p-4 w-full max-w-2xl shadow-sm">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;

          return (
            <div key={label} className="flex-1 flex items-center">
              {/* Círculo fijo */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 flex-shrink-0
                  ${
                    isActive
                      ? "bg-blue-800 text-white border-blue-800"
                      : isCompleted
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-400"
                  }`}
              >
                {stepNumber}
              </div>

              {/* Texto */}
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive
                    ? "text-blue-800"
                    : isCompleted
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>

              {/* Línea de conexión */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
