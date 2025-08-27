import { ExtraServices } from "./index";

export function FormStep({ step, onChange, data }) {
  const inputClass =
    "w-full max-w-md h-11 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-white text-gray-700 placeholder-gray-400 appearance-none";

  const labelClass = "block text-sm font-medium text-gray-800 mb-1 text-left w-full max-w-md";

  // Estilos extras para remover flechas en inputs numéricos
  const numberInputClass = `${inputClass} [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]`;

  switch (step) {
    case 1:
      return (
        <div className="flex flex-col items-center justify-center space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Ingresa tus datos de la reserva
          </h2>

          {/* Tipo de documento */}
          <div className="w-full max-w-md">
            <label className={labelClass}>Tipo de documento</label>
            <select
              value={data.tipoDocumento || ""}
              onChange={(e) => onChange("tipoDocumento", e.target.value)}
              className={inputClass}
            >
              <option value="">Selecciona un tipo</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>

          {/* Número de documento */}
          <div className="w-full max-w-md">
            <label className={labelClass}>Número de documento</label>
            <input
              type="number"
              placeholder="Ej: 1234567890"
              value={data.numeroDocumento || ""}
              onChange={(e) => onChange("numeroDocumento", e.target.value)}
              className={numberInputClass}
            />
          </div>

          {/* Número de celular */}
          <div className="w-full max-w-md">
            <label className={labelClass}>Número de celular</label>
            <input
              type="number"
              placeholder="Ej: 3001234567"
              value={data.numeroCelular || ""}
              onChange={(e) => onChange("numeroCelular", e.target.value)}
              className={numberInputClass}
            />
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
            Fecha a reservar
          </h2>
          <div className="w-full max-w-md">
            <label className={labelClass}>Fecha de reserva</label>
            <input
              type="date"
              value={data.fecha || ""}
              onChange={(e) => onChange("fecha", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      );

    case 3:
      return (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm w-full space-y-4">
          <h2 className="text-xl font-bold mb-2 text-gray-900 text-center">
            Agregar Servicios extras
          </h2>
          <div className="w-full max-w-md">
            <ExtraServices data={data} onChange={onChange} />
          </div>
        </div>
      );

    case 4:
      return (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm w-full">
          <h2 className="text-xl font-bold mb-2 text-gray-900 text-center">
            Pago
          </h2>
        </div>
      );

    default:
      return null;
  }
}
