import { useState } from 'react';
import { NavBarProveedores } from "./index";

export function Balance() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [añoSeleccionado, setAñoSeleccionado] = useState('2024');

  // Datos de ejemplo
  const datosFinancieros = {
    resumen: {
      ingresosTotales: 2850000,
      bodegasReservadas: 8,
      bodegasDisponibles: 12,
      comisionPlataforma: 285000,
      ingresoNeto: 2565000
    },
    ingresosPorMes: [
      { mes: 'Ene', ingresos: 450000, reservas: 3 },
      { mes: 'Feb', ingresos: 380000, reservas: 2 },
      { mes: 'Mar', ingresos: 520000, reservas: 4 },
      { mes: 'Apr', ingresos: 490000, reservas: 3 },
      { mes: 'May', ingresos: 580000, reservas: 5 },
      { mes: 'Jun', ingresos: 430000, reservas: 3 }
    ],
    bodegasMasRentables: [
      { id: 1, nombre: 'Bodega 25m³ - Palmira', ingresos: 450000, ocupacion: '95%' },
      { id: 2, nombre: 'Bodega 15m³ - Yumbo', ingresos: 350000, ocupacion: '87%' },
      { id: 3, nombre: 'Mini bodega 10m³ - Palmira', ingresos: 250000, ocupacion: '92%' }
    ]
  };

  const descargarInforme = () => {
    // Simulación de descarga de informe
    const elemento = document.createElement('a');
    const contenido = `
INFORME FINANCIERO - ${periodoSeleccionado.toUpperCase()} ${añoSeleccionado}
===============================================

RESUMEN GENERAL:
- Ingresos Totales: $${datosFinancieros.resumen.ingresosTotales.toLocaleString()}
- Bodegas Reservadas: ${datosFinancieros.resumen.bodegasReservadas}
- Bodegas Disponibles: ${datosFinancieros.resumen.bodegasDisponibles}
- Comisión Plataforma: $${datosFinancieros.resumen.comisionPlataforma.toLocaleString()}
- Ingreso Neto: $${datosFinancieros.resumen.ingresoNeto.toLocaleString()}

INGRESOS POR MES:
${datosFinancieros.ingresosPorMes.map(item => 
  `${item.mes}: $${item.ingresos.toLocaleString()} (${item.reservas} reservas)`
).join('\n')}

BODEGAS MÁS RENTABLES:
${datosFinancieros.bodegasMasRentables.map((bodega, index) => 
  `${index + 1}. ${bodega.nombre}: $${bodega.ingresos.toLocaleString()} (${bodega.ocupacion} ocupación)`
).join('\n')}

Generado el: ${new Date().toLocaleDateString()}
    `;
    
    const archivo = new Blob([contenido], { type: 'text/plain' });
    elemento.href = URL.createObjectURL(archivo);
    elemento.download = `informe-financiero-${periodoSeleccionado}-${añoSeleccionado}.txt`;
    elemento.click();
  };

  const maxIngresos = Math.max(...datosFinancieros.ingresosPorMes.map(item => item.ingresos));

  return (
    <>
      <NavBarProveedores />
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#2C3A61]">
              Balance Financiero
            </h2>
            <div className="flex gap-4 items-center">
              {/* Filtros */}
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              >
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
              </select>
              
              {/* Botón descargar */}
              <button
                onClick={descargarInforme}
                className="bg-[#2C3A61] text-white px-6 py-2 rounded-lg hover:bg-[#1e2a4a] transition-colors flex items-center gap-2"
              >
                <span>📄</span>
                Descargar Informe
              </button>
            </div>
          </div>

          {/* Cards de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${datosFinancieros.resumen.ingresosTotales.toLocaleString()}
                  </p>
                </div>
                <div className="text-green-500 text-3xl">💰</div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Bodegas Reservadas</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {datosFinancieros.resumen.bodegasReservadas}
                  </p>
                </div>
                <div className="text-blue-500 text-3xl">🏢</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Comisión Plataforma</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    ${datosFinancieros.resumen.comisionPlataforma.toLocaleString()}
                  </p>
                </div>
                <div className="text-yellow-500 text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Ingreso Neto</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${datosFinancieros.resumen.ingresoNeto.toLocaleString()}
                  </p>
                </div>
                <div className="text-purple-500 text-3xl">💵</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico de ingresos por mes */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#2C3A61] mb-6">Ingresos por Mes</h3>
              <div className="space-y-4">
                {datosFinancieros.ingresosPorMes.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-600">
                      {item.mes}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          ${item.ingresos.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.reservas} reservas
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-[#2C3A61] h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(item.ingresos / maxIngresos) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bodegas más rentables */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-[#2C3A61] mb-6">Bodegas Más Rentables</h3>
              <div className="space-y-4">
                {datosFinancieros.bodegasMasRentables.map((bodega, index) => (
                  <div 
                    key={bodega.id} 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2C3A61] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {bodega.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ocupación: {bodega.ocupacion}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2C3A61]">
                          ${bodega.ingresos.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          /mes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-6">Análisis de Rendimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="text-center">
                <div className="text-3xl font-bold text-[#2C3A61] mb-2">
                  {((datosFinancieros.resumen.bodegasReservadas / (datosFinancieros.resumen.bodegasReservadas + datosFinancieros.resumen.bodegasDisponibles)) * 100).toFixed(1)}%
                </div>
                <p className="text-gray-600 text-sm font-medium">Tasa de Ocupación</p>
                <p className="text-xs text-gray-500 mt-1">
                  {datosFinancieros.resumen.bodegasReservadas} de {datosFinancieros.resumen.bodegasReservadas + datosFinancieros.resumen.bodegasDisponibles} bodegas
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-[#2C3A61] mb-2">
                  ${(datosFinancieros.resumen.ingresosTotales / datosFinancieros.resumen.bodegasReservadas).toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm font-medium">Ingreso Promedio</p>
                <p className="text-xs text-gray-500 mt-1">
                  Por bodega reservada
                </p>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-[#2C3A61] mb-2">
                  {((datosFinancieros.resumen.comisionPlataforma / datosFinancieros.resumen.ingresosTotales) * 100).toFixed(1)}%
                </div>
                <p className="text-gray-600 text-sm font-medium">Comisión Promedio</p>
                <p className="text-xs text-gray-500 mt-1">
                  De los ingresos totales
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}