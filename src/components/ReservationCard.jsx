export function ReservationCard({ reservationData = {} }) {
  const { 
    fechaInicio, 
    servicios = [], 
    tipoDocumento, 
    numeroDocumento, 
    numeroCelular,
    bodegaSeleccionada 
  } = reservationData;

  // Tipos de documento para mostrar el label
  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'NIT', label: 'NIT (Persona Jurídica)' }
  ];

  const getTipoDocumentoLabel = (value) => {
    const tipo = tiposDocumento.find(t => t.value === value);
    return tipo ? tipo.label : value;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
      {/* Resumen de reserva */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: "#2C3A61" }}>
          Resumen de tu reserva
        </h3>
        
        {/* Información de la Bodega */}
        {bodegaSeleccionada && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-3" style={{ color: "#2C3A61" }}>
              Bodega Seleccionada
            </h4>
            
            {/* Imagen de la bodega */}
            {bodegaSeleccionada.image && (
              <img 
                src={bodegaSeleccionada.image} 
                alt={bodegaSeleccionada.name}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#2C3A61" }}>Ubicación:</span>
                <span style={{ color: "#2C3A61" }} className="font-medium">
                  {bodegaSeleccionada.name} - {bodegaSeleccionada.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#2C3A61" }}>Tamaño:</span>
                <span style={{ color: "#2C3A61" }} className="font-medium">
                  {bodegaSeleccionada.tamaño}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#2C3A61" }}>Precio:</span>
                <span style={{ color: "#2C3A61" }} className="font-medium">
                  ${bodegaSeleccionada.precio?.toLocaleString()}/mes
                </span>
              </div>
              <div className="mt-3">
                <span style={{ color: "#2C3A61" }} className="font-medium">Descripción:</span>
                <p className="text-xs mt-1" style={{ color: "#2C3A61" }}>
                  {bodegaSeleccionada.description}
                </p>
              </div>
              
              {/* Features si existen */}
              {bodegaSeleccionada.features && bodegaSeleccionada.features.length > 0 && (
                <div className="mt-3">
                  <span style={{ color: "#2C3A61" }} className="font-medium">Características:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {bodegaSeleccionada.features.slice(0, 2).map((feature, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Información Personal */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3" style={{ color: "#2C3A61" }}>
            Información Personal
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: "#2C3A61" }}>Tipo de documento:</span>
              <span style={{ color: "#2C3A61" }}>
                {tipoDocumento ? getTipoDocumentoLabel(tipoDocumento) : "No seleccionado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#2C3A61" }}>Número:</span>
              <span style={{ color: "#2C3A61" }}>
                {numeroDocumento || "No ingresado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "#2C3A61" }}>Celular:</span>
              <span style={{ color: "#2C3A61" }}>
                {numeroCelular || "No ingresado"}
              </span>
            </div>
          </div>
        </div>

        {/* Fecha de inicio */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2" style={{ color: "#2C3A61" }}>
            Fecha de inicio
          </h4>
          <p className="text-sm" style={{ color: "#2C3A61" }}>
            {fechaInicio || "No seleccionada"}
          </p>
        </div>

        {/* Servicios extras */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2" style={{ color: "#2C3A61" }}>
            Servicios extras
          </h4>
          {servicios.length > 0 ? (
            <div className="space-y-1">
              {servicios.map((servicio, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-sm" style={{ color: "#2C3A61" }}>
                    {servicio}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No se han seleccionado servicios extras
            </p>
          )}
        </div>
      </div>
    </div>
  );
}