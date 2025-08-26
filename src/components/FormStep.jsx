import { ExtraServices } from "./index";

export function FormStep({ step, onChange, data }) {
  switch (step) {
    case 1:
      return (
        <div>
            <h2>Ingresa tus datos de la reserva</h2>
          <h3 className="text-xl font-bold mb-2">Tipo de documento</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Tipo de documento</label>
            <select
                value={data.tipoDocumento || ""}
                onChange={(e) => onChange("tipoDocumento", e.target.value)}
                className="border p-2 rounded w-full"
            >
                <option value="">Selecciona un tipo</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PAS">Pasaporte</option>
            </select>
            </div>
            <label className="block text-sm font-medium mb-1">Numero de documento</label>
          <input
            type="number"
            placeholder="Numero de documento"
            value={data.numeroDocumento || ""}
            onChange={(e) => onChange("numeroDocumento", e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="Numero de Celular"
            value={data.numeroCelular || ""}
            onChange={(e) => onChange("numeroCelular", e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
      );
    case 2:
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">Fecha a reservar</h2>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Fecha de reserva</label>
            <input
                type="date"
                value={data.fecha || ""}
                onChange={(e) => onChange("fecha", e.target.value)}
                className="border p-2 rounded w-full"
            />
            </div>
        </div>
      );
    case 3:
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">Confirmación</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
          <p className="mt-2">Revisa tus datos antes de enviar 🚀</p>
        </div>
      );
    case 4:
        return (
        <div>
            <h2 className="text-xl font-bold mb-2">Agregar Servicios extras</h2>
            <ExtraServices data={data} onChange={onChange} />
        </div>
      );
    default:
      return null;
  }
}
