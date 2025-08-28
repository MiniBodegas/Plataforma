import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CompanyDescription, FormStepper, ReservationCard } from "../../components/index";

export function Reservation() {
  const location = useLocation();
  
  // Estado compartido para los datos del formulario
  const [reservationData, setReservationData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    numeroCelular: '',
    fechaInicio: '',
    servicios: [],
    // Datos de la bodega seleccionada
    bodegaSeleccionada: null,
  });

  // Obtener datos de la bodega desde la navegación
  useEffect(() => {
    if (location.state && location.state.bodegaSeleccionada) {
      setReservationData(prev => ({
        ...prev,
        bodegaSeleccionada: location.state.bodegaSeleccionada
      }));
    }
  }, [location.state]);

  // Función para actualizar los datos desde FormStepper
  const handleFormDataChange = (field, value) => {
    setReservationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <div>
        <CompanyDescription />
      </div>
      
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título centrado */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#2C3A61" }}>
            Rentabox
          </h2>
          <p className="text-lg" style={{ color: "#2C3A61" }}>
            Acopi - Yumbo
          </p>
        </div>

        {/* Layout de dos columnas con espacio adecuado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Columna izquierda - ReservationCard */}
          <div className="order-2 lg:order-1">
            <ReservationCard reservationData={reservationData} />
          </div>

          {/* Columna derecha - FormStepper */}
          <div className="order-1 lg:order-2">
            <FormStepper 
              onDataChange={handleFormDataChange} 
              reservationData={reservationData} 
            />
          </div>
        </div>
      </section>
    </>
  );        
}