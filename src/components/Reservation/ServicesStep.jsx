export function ServicesStep({ formData, handleFormChange, error }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-[#2C3A61]">
          Selecciona servicios adicionales (opcional):
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Seguro", "Transporte", "Acceso 24/7", "Alarma", "CCTV"].map((servicio) => (
            <button
              key={servicio}
              type="button"
              className={`px-4 py-2 rounded-full border font-medium transition
                ${formData.servicios.includes(servicio)
                  ? "bg-[#4B799B] text-white border-[#4B799B]"
                  : "bg-white text-[#2C3A61] border-gray-300 hover:bg-gray-100"}`}
              onClick={() => {
                const servicios = formData.servicios.includes(servicio)
                  ? formData.servicios.filter(s => s !== servicio)
                  : [...formData.servicios, servicio];
                handleFormChange("servicios", servicios);
              }}
            >
              {servicio}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de datos */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-800">Resumen de tu reserva:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Documento:</span>
            <p className="text-gray-600">{formData.tipoDocumento} {formData.numeroDocumento}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Celular:</span>
            <p className="text-gray-600">{formData.numeroCelular}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Fecha inicio:</span>
            <p className="text-gray-600">
              {formData.fechaInicio ? new Date(formData.fechaInicio).toLocaleDateString('es-ES') : 'Sin fecha'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Servicios:</span>
            <p className="text-gray-600">
              {formData.servicios?.length > 0 ? formData.servicios.join(', ') : 'Ninguno'}
            </p>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información importante:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Tu solicitud será enviada a la empresa para aprobación</li>
          <li>• Recibirás una notificación cuando sea aceptada o rechazada</li>
          <li>• El pago se realizará una vez aprobada la reserva</li>
          <li>• Puedes cancelar la reserva antes de que sea aceptada</li>
        </ul>
      </div>

      {/* Error de reserva */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}
    </div>
  );
}