import { useState } from "react";

export function ExtraServices({ data, onChange }) {
  const serviciosDisponibles = ["Limpieza extra", "Desayuno", "Transporte", "Wifi premium"];
  const [seleccionados, setSeleccionados] = useState(data.servicios || []);

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
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {seleccionados.map((servicio) => (
          <span
            key={servicio}
            className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1"
          >
            {servicio}
            <button type="button" onClick={() => quitarServicio(servicio)} className="ml-1 text-red-500 font-bold">
              ×
            </button>
          </span>
        ))}
      </div>

      <select
        value=""
        onChange={(e) => agregarServicio(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Selecciona un servicio</option>
        {serviciosDisponibles.map((servicio) => (
          <option key={servicio} value={servicio}>
            {servicio}
          </option>
        ))}
      </select>
    </div>
  );
}
