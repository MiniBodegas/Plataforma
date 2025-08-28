import { useState, useEffect } from "react";

export function ExtraServices({ data, onChange }) {
  const serviciosDisponibles = ["Limpieza extra", "Desayuno", "Transporte", "Wifi premium"];
  const [seleccionados, setSeleccionados] = useState(data.servicios || []);

  useEffect(() => {
    setSeleccionados(data.servicios || []);
  }, [data.servicios]);

  const agregarServicio = (servicio) => {
    if (!seleccionados.includes(servicio)) {
      const nuevos = [...seleccionados, servicio];
      setSeleccionados(nuevos);
      onChange("servicios", nuevos);
    }
  };

  const quitarServicio = (servicio) => {
    const nuevos = seleccionados.filter((s) => s !== servicio);
    setSeleccionados(nuevos);
    onChange("servicios", nuevos);
  };

  return (
    <div className="bg-white dark:bg-white p-4 rounded-lg border dark:border-gray-200">
      <div className="flex flex-wrap gap-2 mb-4">
        {seleccionados.map((servicio) => (
          <span
            key={servicio}
            className="bg-blue-200 dark:bg-blue-200 text-blue-800 dark:text-blue-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
          >
            {servicio}
            <button 
              type="button" 
              onClick={() => quitarServicio(servicio)} 
              className="ml-1 text-red-500 dark:text-red-500 font-bold hover:text-red-700 dark:hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <select
        value=""
        onChange={(e) => agregarServicio(e.target.value)}
        className="border border-gray-300 dark:border-gray-300 p-3 rounded-md w-full bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
      >
        <option value="">Selecciona un servicio</option>
        {serviciosDisponibles.map((servicio) => (
          <option key={servicio} value={servicio} className="bg-white dark:bg-white text-gray-900 dark:text-gray-900">
            {servicio}
          </option>
        ))}
      </select>
    </div>
  );
}