import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CompanyDescription, FormStepper, ReservationCard } from "../../components/index";
import { marcarBodegaComoReservada, crearReserva } from "../../services/bodegasService";

export function Reservation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Estado compartido para los datos del formulario
  const [reservationData, setReservationData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    numeroCelular: '',
    fechaInicio: '',
    servicios: [],
    bodegaSeleccionada: null,
  });

  // ✅ NUEVO: Estado para manejar el proceso de reserva
  const [reservaEnProceso, setReservaEnProceso] = useState(false);

  // Obtener datos de la bodega desde la navegación
  useEffect(() => {
    if (location.state && location.state.bodegaSeleccionada) {
      setReservationData(prev => ({
        ...prev,
        bodegaSeleccionada: location.state.bodegaSeleccionada
      }));
    }
  }, [location.state]);

  // ✅ FUNCIÓN PARA MANEJAR EL ÉXITO DE LA RESERVA
  const handleReservationSuccess = async (bodegaReservada) => {
    try {
      setReservaEnProceso(true);
      
      console.log('🎉 Reserva exitosa, redirigiendo a confirmación:', bodegaReservada);
      
      // ✅ LA ACTUALIZACIÓN DE DISPONIBILIDAD YA SE HIZO EN FormStepper
      // Solo redirigir a confirmación
      navigate('/confirmacion-reserva', {
        state: {
          reservaConfirmada: true,
          bodegaReservada: bodegaReservada,
          datosReserva: reservationData
        }
      });
      
    } catch (error) {
      console.error('❌ Error procesando reserva exitosa:', error);
      alert('Error al confirmar la reserva. Por favor contacta soporte.');
    } finally {
      setReservaEnProceso(false);
    }
  };

  // Función para actualizar los datos desde FormStepper
  const handleFormDataChange = (field, value) => {
    setReservationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ EXTRAER Y PROCESAR DATOS DE LA BODEGA SELECCIONADA
  const bodegaInfo = reservationData.bodegaSeleccionada;

  // ✅ CREAR WAREHOUSE PARA COMPANYDESCRIPTION (IGUAL QUE EN BODEGAS DISPONIBLES)
  const safeWarehouse = bodegaInfo ? {
    id: bodegaInfo.empresaId || bodegaInfo.id,
    name: bodegaInfo.name || "Empresa sin nombre",
    city: bodegaInfo.city || "Ciudad no disponible",
    zone: bodegaInfo.zone || "Zona no disponible", 
    location: bodegaInfo.location || `${bodegaInfo.city || 'Ciudad'} - ${bodegaInfo.zone || 'Zona'}`,
    address: bodegaInfo.address || "Dirección no disponible",
    description: bodegaInfo.description || `${bodegaInfo.name || 'Esta empresa'} ofrece espacios seguros y accesibles para almacenamiento.`,
    features: bodegaInfo.features || [
      "Vigilancia 24/7",
      "Acceso controlado", 
      "Iluminación LED",
      "Fácil acceso vehicular"
    ],
    rating: bodegaInfo.rating || 4.5,
    reviewCount: bodegaInfo.reviewCount || 25,
    images: bodegaInfo.image ? [bodegaInfo.image] : [],
    companyImage: bodegaInfo.image,
    // ✅ DATOS ESPECÍFICOS DE LA BODEGA SELECCIONADA
    totalBodegas: 1, // Solo la bodega seleccionada
    availableSizes: bodegaInfo.tamaño ? [bodegaInfo.tamaño] : [],
    priceRange: bodegaInfo.precio ? {
      min: bodegaInfo.precio,
      max: bodegaInfo.precio
    } : { min: 0, max: 0 },
    miniBodegas: bodegaInfo ? [{
      id: bodegaInfo.id,
      ciudad: bodegaInfo.city,
      zona: bodegaInfo.zone,
      metraje: bodegaInfo.tamaño?.replace('m³', '') || '0',
      precio_mensual: bodegaInfo.precio || 0,
      disponible: bodegaInfo.available !== false,
      descripcion: bodegaInfo.description,
      direccion: bodegaInfo.address
    }] : []
  } : null;

  // ✅ TÍTULO DINÁMICO IGUAL QUE EN BODEGAS DISPONIBLES
  const tituloEmpresa = bodegaInfo ? 
    `${bodegaInfo.name}${bodegaInfo.city ? ` - ${bodegaInfo.city}` : ''}` : 
    "Empresa sin nombre";

  console.log('✅ Reservation - Warehouse creado:', {
    safeWarehouse: safeWarehouse ? {
      name: safeWarehouse.name,
      city: safeWarehouse.city,
      zone: safeWarehouse.zone,
      totalBodegas: safeWarehouse.totalBodegas,
      priceRange: safeWarehouse.priceRange
    } : null,
    tituloEmpresa
  });

  return (
    <>
      {/* ✅ MISMO COMPANYDESCRIPTION QUE EN BODEGAS DISPONIBLES */}
      {safeWarehouse && (
        <CompanyDescription 
          warehouse={safeWarehouse}         // ✅ Datos de la bodega seleccionada
          name={tituloEmpresa}             // ✅ "Rentabox - Medellín" 
          description={safeWarehouse.description}
          address={safeWarehouse.address}
          features={safeWarehouse.features}
          rating={safeWarehouse.rating}
          reviewCount={safeWarehouse.reviewCount}
        />
      )}
      
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        {/* ✅ MOSTRAR ESTADO SI ESTÁ PROCESANDO */}
        {reservaEnProceso && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-700">Confirmando reserva...</p>
                <p className="text-sm text-gray-500 mt-2">Por favor espera</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ TÍTULO DINÁMICO CON DATOS REALES */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#2C3A61" }}>
            {tituloEmpresa}
          </h2>
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
              // ✅ PASAR LA FUNCIÓN DE ÉXITO
              onReservationSuccess={handleReservationSuccess}
              disabled={reservaEnProceso}
            />
          </div>
        </div>

        {/* ✅ MENSAJE SI NO HAY DATOS */}
        {!bodegaInfo && (
          <div className="text-center mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-700 text-lg mb-2">
              ⚠️ No se encontraron datos de la bodega seleccionada
            </p>
            <p className="text-yellow-600 text-sm">
              Regresa y selecciona una bodega para continuar con la reserva
            </p>
          </div>
        )}
      </section>
    </>
  );        
}