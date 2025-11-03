import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeroSection, FilterSidebar, WarehouseCard } from '../../components/index'
import { useWarehouses } from '../../hooks/useWarehouses'

export function BodegaScreen() {
  const [searchParams] = useSearchParams()
  const [filteredWarehouses, setFilteredWarehouses] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  
  const [filters, setFilters] = useState({
    locations: [],
    priceRange: [0, 3500000],
    size: '',
    features: [],
    rating: 0
  })
  
  const ciudadSeleccionada = searchParams.get('ciudad') || ''
  const zonaSeleccionada = searchParams.get('zona') || ''
  const empresaSeleccionada = searchParams.get('empresa') || ''
  
  const minMetrajeParam = searchParams.get('minMetraje')
  const maxMetrajeParam = searchParams.get('maxMetraje')
  
  const { warehouses, loading, error, refetch } = useWarehouses()


  // ✅ APLICAR FILTROS DE URL AL SIDEBAR - MÁS FLEXIBLE
  useEffect(() => {
    // Inicializar nuevos filtros basados en los actuales
    const newFilters = { ...filters };
    
    // Procesar parámetros de metraje y actualizar el filtro size
    if (minMetrajeParam || maxMetrajeParam) {
      const min = parseInt(minMetrajeParam);
      const max = parseInt(maxMetrajeParam);
      
      // ✅ SER MÁS FLEXIBLE CON LOS RANGOS
      if (!isNaN(min) && !isNaN(max)) {
        // Caso: tenemos min y max - USAR RANGOS APROXIMADOS
        if (min >= 0 && min <= 2 && max >= 13 && max <= 17) {
          newFilters.size = '1-15 m³';
        } else if (min >= 14 && min <= 17 && max >= 38 && max <= 42) {
          newFilters.size = '15-40 m³';
        }
      } else if (!isNaN(min)) {
        // ✅ MÁS FLEXIBLE CON EL VALOR MÍNIMO
        if (min >= 40) { // En lugar de exactamente 42
          newFilters.size = '+42 m³';
        }
      }
            
      // Actualizar el estado de filtros
      setFilters(newFilters);
    }
  }, [minMetrajeParam, maxMetrajeParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ FUNCIÓN PARA NORMALIZAR TEXTO (elimina acentos, espacios extra)
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // ✅ FUNCIÓN PARA APLICAR FILTROS - MUCHO MÁS FLEXIBLE
  const aplicarFiltros = (warehouse) => {
    // Si no hay mini bodegas, no aplicar filtros
    if (!warehouse.miniBodegas || warehouse.miniBodegas.length === 0) {
      return false;
    }

    let bodegasValidas = [...warehouse.miniBodegas];

    // ✅ FILTRO POR ZONAS MÁS FLEXIBLE
    if (filters.locations && filters.locations.length > 0) {
      bodegasValidas = bodegasValidas.filter(bodega => {
        // Si la bodega no tiene zona, permitirla si no estamos filtrando por zona específica
        if (!bodega.zona) return true;
        
        // Normalizar la zona de la bodega
        const zonaBodega = normalizarTexto(bodega.zona);
        
        // Verificar si alguna zona seleccionada coincide parcialmente
        return filters.locations.some(zonaFiltro => {
          const zonaFiltroNorm = normalizarTexto(zonaFiltro);
          return zonaBodega.includes(zonaFiltroNorm) || zonaFiltroNorm.includes(zonaBodega);
        });
      });
      
      if (bodegasValidas.length === 0) return false;
    }

    // ✅ FILTRO POR PRECIO MÁS FLEXIBLE (5% de tolerancia)
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 3500000)) {
      const minPrecio = filters.priceRange[0];
      const maxPrecio = filters.priceRange[1];
      
      // Añadir 5% de tolerancia
      const minConTolerancia = minPrecio * 0.95;
      const maxConTolerancia = maxPrecio * 1.05;
      
      bodegasValidas = bodegasValidas.filter(bodega => {
        const precio = parseFloat(bodega.precio_mensual);
        if (isNaN(precio)) return true; // Si no tiene precio, permitirla
        
        return precio >= minConTolerancia && precio <= maxConTolerancia;
      });
      
      if (bodegasValidas.length === 0) return false;
    }

    // ✅ FILTRO POR TAMAÑO MUCHO MÁS FLEXIBLE
    if (filters.size || minMetrajeParam || maxMetrajeParam) {
      // Determinar valores de metraje a filtrar
      let minMetraje = null;
      let maxMetraje = null;
      
      // Primero obtener de URL params
      if (minMetrajeParam) {
        minMetraje = parseFloat(minMetrajeParam);
      }
      if (maxMetrajeParam) {
        maxMetraje = parseFloat(maxMetrajeParam);
      }
      
      // Si no hay en URL, usar filtros del sidebar
      if (!minMetraje && !maxMetraje && filters.size) {
        switch (filters.size) {
          case '1-15 m³':
            minMetraje = 1;
            maxMetraje = 15;
            break;
          case '15-40 m³':
            minMetraje = 15;
            maxMetraje = 40;
            break;
          case '+42 m³':
            minMetraje = 42;
            break;
        }
      }
      
      // Aplicar filtro si tenemos valores
      if (minMetraje !== null || maxMetraje !== null) {
        // ✅ AÑADIR TOLERANCIA SIGNIFICATIVA (±3m³)
        const TOLERANCIA = 3;
        
        bodegasValidas = bodegasValidas.filter(bodega => {
          const metraje = parseFloat(bodega.metraje);
          if (isNaN(metraje)) return true; // Si no tiene metraje, permitirla
          
          if (minMetraje !== null && maxMetraje !== null) {
            // Rango con tolerancia
            return metraje >= (minMetraje - TOLERANCIA) && metraje <= (maxMetraje + TOLERANCIA);
          } else if (minMetraje !== null) {
            // Solo mínimo con tolerancia
            return metraje >= (minMetraje - TOLERANCIA);
          } else if (maxMetraje !== null) {
            // Solo máximo con tolerancia
            return metraje <= (maxMetraje + TOLERANCIA);
          }
          return true;
        });
        
        if (bodegasValidas.length === 0) return false;
      }
    }

    // ✅ FILTRO POR CARACTERÍSTICAS - CAMBIAR EVERY POR SOME
    if (filters.features && filters.features.length > 0) {
      bodegasValidas = bodegasValidas.filter(bodega => {
        // ✅ CAMBIO IMPORTANTE: Usar SOME en lugar de EVERY
        // Una bodega pasa si tiene AL MENOS UNA de las características seleccionadas
        return filters.features.some(feature => {
          const featureNorm = normalizarTexto(feature);
          
          // Buscar en múltiples campos
          return (
            (warehouse.features?.some(f => normalizarTexto(f).includes(featureNorm))) ||
            (bodega.caracteristicas && normalizarTexto(bodega.caracteristicas).includes(featureNorm)) ||
            (bodega.seguridad && normalizarTexto(bodega.seguridad).includes(featureNorm)) ||
            (bodega.acceso && normalizarTexto(bodega.acceso).includes(featureNorm))
          );
        });
      });
      
      if (bodegasValidas.length === 0) return false;
    }

    // ✅ FILTRO POR CALIFICACIÓN MÁS FLEXIBLE
    if (filters.rating > 0) {
      const rating = parseFloat(warehouse.rating) || 0;
      // Permitir 0.5 menos que el mínimo seleccionado
      if (rating < (filters.rating - 0.5)) return false;
    }

    // ✅ ACTUALIZAR LAS BODEGAS DEL WAREHOUSE PARA MOSTRAR SOLO LAS VÁLIDAS
    warehouse.miniBodegas = bodegasValidas;
    warehouse.totalBodegas = bodegasValidas.length;

    return true;
  }

  // ✅ FILTRADO PRINCIPAL - MUCHO MÁS FLEXIBLE
  useEffect(() => {
    if (!warehouses || warehouses.length === 0) {
      setFilteredWarehouses([]);
      return;
    }
    
    // Crear copias profundas para modificar sin afectar los datos originales
    const warehousesCopy = JSON.parse(JSON.stringify(warehouses));
    
    let filtered = warehousesCopy
      .map(warehouse => {
        // Crear copia del warehouse y sus bodegas
        let filteredWarehouse = { ...warehouse };
        let bodegasFiltradas = [...(warehouse.miniBodegas || [])];
        
        // ✅ FILTRO DE CIUDAD MÁS FLEXIBLE
        if (ciudadSeleccionada) {
          const ciudadBusquedaNorm = normalizarTexto(ciudadSeleccionada);
          
          bodegasFiltradas = bodegasFiltradas.filter(bodega => {
            if (!bodega.ciudad) return false;
            
            const ciudadBodegaNorm = normalizarTexto(bodega.ciudad);
            
            // ✅ COINCIDENCIA PARCIAL EN AMBAS DIRECCIONES
            return ciudadBodegaNorm.includes(ciudadBusquedaNorm) || 
                   ciudadBusquedaNorm.includes(ciudadBodegaNorm);
          });
          
          if (bodegasFiltradas.length === 0) {
            return null; // No hay bodegas en esta ciudad
          }
          
          // Actualizar warehouse con las bodegas filtradas
          filteredWarehouse.miniBodegas = bodegasFiltradas;
          filteredWarehouse.totalBodegas = bodegasFiltradas.length;
          
          // Actualizar propiedades derivadas
          const precios = bodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p));
          filteredWarehouse.priceRange = precios.length > 0 ? {
            min: Math.min(...precios),
            max: Math.max(...precios)
          } : { min: 0, max: 0 };
        }
        
        // ✅ FILTRO DE ZONA MÁS FLEXIBLE
        if (zonaSeleccionada) {
          const zonaBusquedaNorm = normalizarTexto(zonaSeleccionada);
          
          bodegasFiltradas = filteredWarehouse.miniBodegas.filter(bodega => {
            if (!bodega.zona) return false;
            
            const zonaBodegaNorm = normalizarTexto(bodega.zona);
            
            // Coincidencia parcial en ambas direcciones
            return zonaBodegaNorm.includes(zonaBusquedaNorm) || 
                   zonaBusquedaNorm.includes(zonaBodegaNorm);
          });
          
          if (bodegasFiltradas.length === 0) {
            return null; // No hay bodegas en esta zona
          }
          
          filteredWarehouse.miniBodegas = bodegasFiltradas;
          filteredWarehouse.totalBodegas = bodegasFiltradas.length;
          
          // Actualizar propiedades derivadas
          const precios = bodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p));
          filteredWarehouse.priceRange = precios.length > 0 ? {
            min: Math.min(...precios),
            max: Math.max(...precios)
          } : { min: 0, max: 0 };
        }
        
        // ✅ FILTRO POR EMPRESA MÁS FLEXIBLE
        if (empresaSeleccionada) {
          const empresaBusquedaNorm = normalizarTexto(empresaSeleccionada);
          const nombreEmpresaNorm = normalizarTexto(warehouse.name);
          
          // Coincidencia parcial
          if (!nombreEmpresaNorm.includes(empresaBusquedaNorm) && 
              !empresaBusquedaNorm.includes(nombreEmpresaNorm)) {
            return null;
          }
        }
        
        return filteredWarehouse;
      })
      .filter(Boolean); // Eliminar nulls
    
    // Aplicar filtros del sidebar
    filtered = filtered.filter(aplicarFiltros);
    
    setFilteredWarehouses(filtered);
    
  }, [warehouses, ciudadSeleccionada, zonaSeleccionada, empresaSeleccionada, filters, minMetrajeParam, maxMetrajeParam]);

  const limpiarTodosLosFiltros = () => {
    setFilters({
      locations: [],
      priceRange: [0, 3500000],
      size: '',
      features: [],
      rating: 0
    });
    
    window.location.href = `/bodegas${ciudadSeleccionada ? `?ciudad=${ciudadSeleccionada}` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando bodegas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center text-red-600">
            <p>Error al cargar las bodegas: {error}</p>
            <button 
              onClick={() => refetch && refetch()} 
              className="mt-4 px-4 py-2 bg-[#4B799B] text-white rounded hover:bg-[#3b5f7a]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ GENERAR TÍTULO DINÁMICO MEJORADO
  const generarTitulo = () => {
    const partes = []
    if (empresaSeleccionada) partes.push(empresaSeleccionada)
    if (zonaSeleccionada) partes.push(zonaSeleccionada)  
    if (ciudadSeleccionada) partes.push(ciudadSeleccionada)
    
    let tamaño = '';
    // Añadir información de tamaño al título
    if (filters.size) {
      tamaño = filters.size;
    } else if (minMetrajeParam && maxMetrajeParam) {
      tamaño = `${minMetrajeParam}-${maxMetrajeParam} m³`;
    } else if (minMetrajeParam) {
      tamaño = `+${minMetrajeParam} m³`;
    } else if (maxMetrajeParam) {
      tamaño = `hasta ${maxMetrajeParam} m³`;
    }
    
    if (tamaño) partes.push(tamaño);
    
    const totalBodegas = filteredWarehouses.reduce((acc, w) => acc + w.miniBodegas.length, 0);
    
    if (partes.length > 0) {
      return `Bodegas ${partes.join(' - ')} (${totalBodegas} resultados)`
    }
    return `Bodegas disponibles (${totalBodegas} resultados)`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* TÍTULO DINÁMICO */}
      {(ciudadSeleccionada || zonaSeleccionada || empresaSeleccionada || 
        minMetrajeParam || maxMetrajeParam ||
        filters.locations.length > 0 || filters.size || filters.features.length > 0 || filters.rating > 0) && (
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-[1500px] mx-auto">
            <h2 className="text-xl font-semibold" style={{ color: "#2C3A61" }}>
              {generarTitulo()}
            </h2>
            
            {/* MOSTRAR FILTROS ACTIVOS */}
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
              {ciudadSeleccionada && (
                <span className="bg-green-100 px-2 py-1 rounded">
                  Ciudad: {ciudadSeleccionada}
                </span>
              )}
              {filters.locations.length > 0 && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Zonas: {filters.locations.join(', ')}
                </span>
              )}
              {(filters.size || minMetrajeParam || maxMetrajeParam) && (
                <span className="bg-yellow-100 px-2 py-1 rounded">
                  Tamaño: {
                    filters.size || 
                    (minMetrajeParam && maxMetrajeParam ? `${minMetrajeParam}-${maxMetrajeParam} m³` :
                     minMetrajeParam ? `+${minMetrajeParam} m³` : 
                     maxMetrajeParam ? `hasta ${maxMetrajeParam} m³` : '')
                  }
                </span>
              )}
              {filters.rating > 0 && (
                <span className="bg-yellow-100 px-2 py-1 rounded">
                  ⭐ {filters.rating}+
                </span>
              )}
              {filters.features.length > 0 && (
                <span className="bg-purple-100 px-2 py-1 rounded">
                  +{filters.features.length} características
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden flex justify-end px-4 py-2">
        <button
          className="bg-[#4B799B] text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-[#3b5f7a] transition-colors"
          onClick={() => setShowFilters(true)}
        >
          Filtros ({filteredWarehouses.reduce((acc, w) => acc + w.miniBodegas.length, 0)})
        </button>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-1">
          <FilterSidebar 
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={setFilters}
            ciudadSeleccionada={ciudadSeleccionada}
            hideMapOnMobile={true}
            urlParams={{
              minMetraje: minMetrajeParam,
              maxMetraje: maxMetrajeParam
            }}
          />
        </div>
        <div className="md:col-span-3">
          {filteredWarehouses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWarehouses.map((warehouse) => (
                <WarehouseCard 
                  key={warehouse.id} 
                  warehouse={warehouse}
                  filtroActivo={{
                    ciudad: ciudadSeleccionada,
                    zona: zonaSeleccionada, 
                    empresa: empresaSeleccionada,
                    minMetraje: minMetrajeParam,
                    maxMetraje: maxMetrajeParam
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No se encontraron bodegas que coincidan con tu búsqueda
              </p>
              <button
                onClick={limpiarTodosLosFiltros}
                className="bg-[#4B799B] hover:bg-[#3b5f7a] text-white px-6 py-2 rounded-md"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>            
    </div>
  )
}