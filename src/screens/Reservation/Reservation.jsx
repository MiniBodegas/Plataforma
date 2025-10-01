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

  // ✅ DEBUG: Ver qué datos llegan de la navegación
  console.log('🔍 Reservation - Datos de navegación:', {
    locationState: location.state,
    bodegaSeleccionada: location.state?.bodegaSeleccionada
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

  // ✅ EXTRAER Y PROCESAR DATOS DE LA BODEGA SELECCIONADA
  const bodegaInfo = reservationData.bodegaSeleccionada;

  // ✅ CREAR WAREHOUSE PARA COMPANYDESCRIPTION (IGUAL QUE EN BODEGAS DISPONIBLES)
  const warehouse = bodegaInfo ? {
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

  console.log('✅ Reservation - Warehouse creado:', {
    warehouse: warehouse ? {
      name: warehouse.name,
      city: warehouse.city,
      zone: warehouse.zone,
      totalBodegas: warehouse.totalBodegas,
      priceRange: warehouse.priceRange
    } : null
  });

  return (
    <>
      {/* ✅ MISMO COMPANYDESCRIPTION QUE EN BODEGAS DISPONIBLES */}
      {warehouse && (
        <CompanyDescription 
          warehouse={warehouse}
          name={warehouse.name}
          description={warehouse.description}
          address={warehouse.address}
          features={warehouse.features}
          rating={warehouse.rating}
          reviewCount={warehouse.reviewCount}
        />
      )}
      
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        {/* ✅ TÍTULO DINÁMICO CON DATOS REALES */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#2C3A61" }}>
            {warehouse?.name || "Empresa sin nombre"}
          </h2>
        </div>

        {/* ✅ LAYOUT DE DOS COLUMNAS - POSICIONES CAMBIADAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* ✅ Columna izquierda - FormStepper (antes derecha) */}
          <div className="order-1 lg:order-1">
            <FormStepper 
              onDataChange={handleFormDataChange} 
              reservationData={reservationData} 
            />
          </div>

          {/* ✅ Columna derecha - ReservationCard (antes izquierda) */}
          <div className="order-2 lg:order-2">
            <ReservationCard reservationData={reservationData} />
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