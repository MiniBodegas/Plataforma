import { useState } from 'react';
import { ReservaCard,NavBarProveedores } from "../../components";

export function Reservas() {
  const [reservas, setReservas] = useState([
    {
      id: 1,
      titulo: "Mini bodega de 10 m³",
      sede: "Sede Yumbo",
      cliente: "Juan Pérez",
      fechaInicio: "10 de octubre",
      precio: 250000,
      estado: "pendiente",
      imagen: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400"
    },
    {
      id: 2,
      titulo: "Bodega de 25 m³",
      sede: "Sede Palmira",
      cliente: "María García",
      fechaInicio: "15 de octubre",
      precio: 450000,
      estado: "pendiente",
      imagen: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400"
    },
    {
      id: 3,
      titulo: "Bodega de 15 m³",
      sede: "Sede Yumbo",
      cliente: "Carlos López",
      fechaInicio: "20 de octubre",
      precio: 350000,
      estado: "aceptada",
      imagen: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=400"
    },
    {
      id: 4,
      titulo: "Mini bodega de 8 m³",
      sede: "Sede Palmira",
      cliente: "Ana Rodríguez",
      fechaInicio: "25 de octubre",
      precio: 280000,
      estado: "rechazada",
      imagen: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=400"
    }
  ]);

  const handleAceptar = (id) => {
    setReservas(prevReservas =>
      prevReservas.map(reserva =>
        reserva.id === id ? { ...reserva, estado: 'aceptada' } : reserva
      )
    );
  };

  const handleRechazar = (id) => {
    setReservas(prevReservas =>
      prevReservas.map(reserva =>
        reserva.id === id ? { ...reserva, estado: 'rechazada' } : reserva
      )
    );
  };

  // Filtrar reservas por estado
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente');
  const reservasAceptadas = reservas.filter(r => r.estado === 'aceptada');
  const reservasRechazadas = reservas.filter(r => r.estado === 'rechazada');

  // Componente para renderizar cada sección
  const renderSeccion = (titulo, reservasArray, colorTitulo, icono, colorFondo) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icono}</span>
        <h3 className={`text-xl font-semibold ${colorTitulo}`}>
          {titulo}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorFondo}`}>
          {reservasArray.length}
        </span>
      </div>
      
      <div className="space-y-4">
        {reservasArray.length > 0 ? (
          reservasArray.map(reserva => (
            <ReservaCard 
              key={reserva.id}
              reserva={reserva}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-4xl mb-3">📋</div>
            <p className="text-gray-500 font-medium">
              No hay reservas {titulo.toLowerCase()}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {titulo === 'Pendientes' && 'Las nuevas solicitudes de reserva aparecerán aquí'}
              {titulo === 'Aceptadas' && 'Las reservas que aceptes se mostrarán en esta sección'}
              {titulo === 'Rechazadas' && 'Las reservas que rechaces aparecerán aquí'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-[#2C3A61] mb-8 text-center">
          Mis mini bodegas
        </h2>
        <NavBarProveedores />

        {/* Resumen simplificado */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-200 text-center">
            <div className="text-xl font-bold text-yellow-700">{reservasPendientes.length}</div>
            <div className="text-yellow-600 text-sm">Pendientes</div>
          </div>
          <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-center">
            <div className="text-xl font-bold text-green-700">{reservasAceptadas.length}</div>
            <div className="text-green-600 text-sm">Aceptadas</div>
          </div>
          <div className="bg-red-50 px-4 py-3 rounded-lg border border-red-200 text-center">
            <div className="text-xl font-bold text-red-700">{reservasRechazadas.length}</div>
            <div className="text-red-600 text-sm">Rechazadas</div>
          </div>
        </div>

        {/* Secciones de reservas */}
        <div className="space-y-10">
          {renderSeccion(
            'Pendientes', 
            reservasPendientes, 
            'text-yellow-600', 
            '⏳',
            'bg-yellow-100 text-yellow-800'
          )}
          
          {renderSeccion(
            'Aceptadas', 
            reservasAceptadas, 
            'text-green-600', 
            '✅',
            'bg-green-100 text-green-800'
          )}
          
          {renderSeccion(
            'Rechazadas', 
            reservasRechazadas, 
            'text-red-600', 
            '❌',
            'bg-red-100 text-red-800'
          )}
        </div>
      </div>
    </div>
  );
}