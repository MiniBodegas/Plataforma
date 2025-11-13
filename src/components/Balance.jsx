import { useEffect, useMemo, useState } from 'react';
import { NavBarProveedores } from "./index";
import { supabase } from '../lib/supabase';

const COMISION_PCT = 0.10; // % comisión de la plataforma

// TODO: Ajusta nombres según tu esquema
const TABLES = {
  empresas: 'empresas',
  bodegas: 'mini_bodegas',
  reservas: 'reservas'
};
const COLS = {
  empresaUserId: 'user_id',
  bodegaEmpresaId: 'empresa_id',
  reservaBodegaId: 'mini_bodega_id', // <- correcto según tu tabla
  reservaFecha: 'fecha_reserva',     // <- usar fecha_reserva (indexada)
  amountKey: 'precio_total',         // <- numeric(10,2) (llega como string)
  reservaEstado: 'estado',
  estadosPagados: ['aceptada', 'completada'] // ingresos reales
};

const MES_ABBR = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function rangoFechas(periodo) {
  const now = new Date();
  const y = now.getFullYear();
  if (periodo === 'mes') {
    const start = new Date(y, now.getMonth(), 1);
    const end = new Date(y, now.getMonth() + 1, 1);
    return { start, end };
  }
  if (periodo === 'trimestre') {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(y, q * 3, 1);
    const end = new Date(y, (q + 1) * 3, 1);
    return { start, end };
  }
  // año actual
  return { start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1) };
}

function pickAmount(row) {
  const v = row?.[COLS.amountKey];
  if (v == null) return 0;
  const n = typeof v === 'number' ? v : parseFloat(v); // numeric llega como string
  return Number.isFinite(n) ? n : 0;
}

const EXTRA = {
  estadosIngreso: ['aceptada','completada'],
  estadosActivos: ['aceptada','completada','pendiente'],
};

function diasEntre(a,b){
  const MS = 86400000;
  return Math.max(0, Math.ceil((b - a)/MS));
}

function generarRangoDias(start,end){
  const arr=[]; const d=new Date(start);
  while(d<end){ arr.push(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1); }
  return arr;
}

export function Balance() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datosFinancieros, setDatosFinancieros] = useState({
    resumen: { ingresosTotales: 0, bodegasReservadas: 0, bodegasDisponibles: 0, comisionPlataforma: 0, ingresoNeto: 0 },
    ingresosPorMes: [],
    bodegasMasRentables: []
  });

  const maxIngresos = useMemo(
    () => Math.max(1, ...datosFinancieros.ingresosPorMes.map(i => i.ingresos)),
    [datosFinancieros.ingresosPorMes]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data:{ user } } = await supabase.auth.getUser();
        if(!user) throw new Error('No hay sesión activa');

        // Empresa del usuario
        const { data: empresa } = await supabase
          .from(TABLES.empresas)
          .select('id')
          .eq(COLS.empresaUserId, user.id)
          .maybeSingle();
        if(!empresa) throw new Error('Empresa no encontrada');

        // Mini bodegas de la empresa (incluye cantidad para capacidad total)
        const { data: bodegas } = await supabase
          .from(TABLES.bodegas)
          .select('id, nombre_personalizado, precio_mensual, cantidad, estado')
          .eq(COLS.bodegaEmpresaId, empresa.id);

        const bodegaIds = bodegas?.map(b=>b.id) ?? [];
        const capacidadTotal = bodegas.reduce((a,b)=> a + (b.cantidad || 1), 0);

        const { start, end } = rangoFechas(periodoSeleccionado);

        // Reservas del periodo (filtrar por empresa_id directo optimiza)
        const { data: reservasRaw } = await supabase
          .from(TABLES.reservas)
          .select(`id, mini_bodega_id, empresa_id, estado, fecha_inicio, fecha_fin, ${COLS.reservaFecha}, ${COLS.amountKey}`)
          .eq('empresa_id', empresa.id)
          .gte(COLS.reservaFecha, start.toISOString())
          .lt(COLS.reservaFecha, end.toISOString());

        const reservas = (reservasRaw||[]).filter(r => EXTRA.estadosActivos.includes(r.estado));

        // Ingresos (solo aceptada + completada)
        const reservasIngresos = reservas.filter(r => EXTRA.estadosIngreso.includes(r.estado));
        const ingresosTotales = reservasIngresos.reduce((acc,r)=> acc + pickAmount(r), 0);
        const comisionPlataforma = Math.round(ingresosTotales * COMISION_PCT);
        const ingresoNeto = ingresosTotales - comisionPlataforma;

        // Ingresos pendientes (estado pendiente)
        const ingresosPendientes = reservas
          .filter(r => r.estado === 'pendiente')
          .reduce((a,r)=> a + pickAmount(r), 0);

        // Duración y ocupación por días
        const periodoDias = diasEntre(start,end);
        let diasReservadosTotal = 0;
        const ocupacionDiaria = {}; // fechaISO -> unidades ocupadas

        reservasIngresos.forEach(r => {
          const ini = new Date(r.fecha_inicio);
          const finReal = r.fecha_fin ? new Date(r.fecha_fin) : end;
          const fin = (finReal > end) ? end : finReal;
          if(fin <= start) return;
          const realIni = ini < start ? start : ini;
          const dur = diasEntre(realIni, fin);
          diasReservadosTotal += dur;
          // marcar ocupación diaria por unidad (asume 1 unidad por reserva)
          const cursor = new Date(realIni);
          while(cursor < fin){
            const key = cursor.toISOString().slice(0,10);
            ocupacionDiaria[key] = (ocupacionDiaria[key] || 0) + 1;
            cursor.setDate(cursor.getDate()+1);
          }
        });

        // Ocupación media (reservas / capacidad / días)
        const ocupacionMediaPct = capacidadTotal > 0
          ? ((Object.values(ocupacionDiaria).reduce((a,v)=>a+v,0)) / (capacidadTotal * periodoDias)) * 100
          : 0;

        // Cancelaciones
        const canceladas = reservasRaw?.filter(r => r.estado === 'cancelada')?.length || 0;
        const tasaCancelacion = reservasRaw && reservasRaw.length > 0
          ? (canceladas / reservasRaw.length) * 100
          : 0;

        // Ingresos por mes (mantener lógica existente)
        const ingresosPorMesMap = new Map();
        reservasIngresos.forEach(r => {
          const d = new Date(r[COLS.reservaFecha]);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const mes = MES_ABBR[d.getMonth()];
          const monto = pickAmount(r);
          const curr = ingresosPorMesMap.get(key) || { mes, ingresos: 0, reservas: 0 };
          curr.ingresos += monto;
          curr.reservas += 1;
          ingresosPorMesMap.set(key, curr);
        });

        let ingresosPorMes = [];
        if (periodoSeleccionado === 'año') {
          const y = new Date().getFullYear();
          ingresosPorMes = Array.from({ length: 12 }).map((_, m) => {
            const key = `${y}-${m}`;
            return ingresosPorMesMap.get(key) || { mes: MES_ABBR[m], ingresos: 0, reservas: 0 };
          });
        } else {
          ingresosPorMes = Array.from(ingresosPorMesMap.values())
            .sort((a,b)=> MES_ABBR.indexOf(a.mes) - MES_ABBR.indexOf(b.mes));
          if(ingresosPorMes.length === 0){
            ingresosPorMes = [{ mes: MES_ABBR[new Date().getMonth()], ingresos: 0, reservas: 0 }];
          }
        }

        // Ranking bodegas (ingresos)
        const ingresosPorBodega = new Map();
        reservasIngresos.forEach(r=>{
          ingresosPorBodega.set(r.mini_bodega_id, (ingresosPorBodega.get(r.mini_bodega_id)||0) + pickAmount(r));
        });

        const bodegasById = new Map(bodegas.map(b => [b.id, b]));
        const bodegasMasRentables = Array.from(ingresosPorBodega.entries())
          .map(([id, ingresos]) => ({
            id,
              nombre: bodegasById.get(id)?.nombre_personalizado || `Bodega ${id.slice(0,6)}`,
              ingresos,
              ocupacion: 'N/D'
          }))
          .sort((a,b)=> b.ingresos - a.ingresos)
          .slice(0,5);

        setDatosFinancieros({
          resumen: {
            ingresosTotales,
            ingresosPendientes,
            ingresoNeto,
            comisionPlataforma,
            bodegasReservadas: ingresosPorBodega.size,
            bodegasDisponibles: Math.max(0, bodegaIds.length - ingresosPorBodega.size),
            ocupacionMediaPct,
            tasaCancelacion
          },
          ingresosPorMes,
          bodegasMasRentables
        });
      } catch(e){
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [periodoSeleccionado]);

  const descargarInforme = () => {
    const contenido = `
INFORME FINANCIERO - ${periodoSeleccionado.toUpperCase()}
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
    const a = document.createElement('a');
    const blob = new Blob([contenido], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    a.download = `informe-financiero-${periodoSeleccionado}.txt`;
    a.click();
  };

  return (
    <>
      <NavBarProveedores />
      <div className="min-h-screen bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-[#2C3A61]">Balance Financiero</h2>
            <div className="flex gap-4 items-center">
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none bg-white"
              >
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
              </select>
              <button
                onClick={descargarInforme}
                className="bg-[#2C3A61] text-white px-6 py-2 rounded-lg hover:bg-[#1e2a4a] transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <span>📄</span>
                Descargar Informe
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

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
                    <div className="w-12 text-sm font-medium text-gray-600">{item.mes}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          ${item.ingresos.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">{item.reservas} reservas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#2C3A61] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(item.ingresos / maxIngresos) * 100}%` }}
                        />
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
                  <div key={bodega.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2C3A61] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{bodega.nombre}</p>
                          <p className="text-xs text-gray-500">Ocupación: {bodega.ocupacion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2C3A61]">${bodega.ingresos.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">/periodo</p>
                      </div>
                    </div>
                  </div>
                ))}
                {datosFinancieros.bodegasMasRentables.length === 0 && (
                  <div className="text-sm text-gray-500">Sin datos en el periodo seleccionado.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}