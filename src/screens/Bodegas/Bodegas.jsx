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


  // ✅ APLICAR FILTROS DE URL AL SIDEBAR
  useEffect(() => {
    const newFilters = { ...filters };
    
    if (minMetrajeParam || maxMetrajeParam) {
      const min = parseInt(minMetrajeParam);
      const max = parseInt(maxMetrajeParam);
      
      if (!isNaN(min) && !isNaN(max)) {
        if (min >= 0 && min <= 2 && max >= 13 && max <= 17) {
          newFilters.size = '1-15 m³';
        } else if (min >= 14 && min <= 17 && max >= 38 && max <= 42) {
          newFilters.size = '15-40 m³';
        }
      } else if (!isNaN(min)) {
        if (min >= 40) {
          newFilters.size = '+42 m³';
        }
      }
            
      setFilters(newFilters);
    }
  }, [minMetrajeParam, maxMetrajeParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ FUNCIÓN PARA NORMALIZAR TEXTO
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    // Convertir a string por si acaso es un número u otro tipo
    return String(texto).toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // ✅ FUNCIÓN PARA APLICAR FILTROS - SIN DEPENDER DE ZONA
  const aplicarFiltros = (warehouse) => {

    
    if (!warehouse.miniBodegas || warehouse.miniBodegas.length === 0) {
      return false;
    }

    let bodegasValidas = [...warehouse.miniBodegas];

    // ✅ FILTRO POR ZONAS - OPCIONAL (solo si la bodega tiene zona)
    if (filters.locations && filters.locations.length > 0) {
      
      bodegasValidas = bodegasValidas.filter(bodega => {
        // ✅ Si la bodega NO tiene zona, la incluimos de todos modos
        if (!bodega.zona) {
          return true;
        }
        
        const zonaBodega = normalizarTexto(bodega.zona);
        
        const cumpleFiltro = filters.locations.some(zonaFiltro => {
          const zonaFiltroNorm = normalizarTexto(zonaFiltro);
          return zonaBodega.includes(zonaFiltroNorm) || zonaFiltroNorm.includes(zonaBodega);
        });
        
        return cumpleFiltro;
      });
      
    }

    // ✅ FILTRO POR PRECIO
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 3500000)) {
      const minPrecio = filters.priceRange[0];
      const maxPrecio = filters.priceRange[1];
      
      
      const minConTolerancia = minPrecio * 0.95;
      const maxConTolerancia = maxPrecio * 1.05;
      
      bodegasValidas = bodegasValidas.filter(bodega => {
        const precio = parseFloat(bodega.precio_mensual);
        if (isNaN(precio)) return true;
        
        const cumple = precio >= minConTolerancia && precio <= maxConTolerancia;
        return cumple;
      });
            
      if (bodegasValidas.length === 0) return false;
    }

    // ✅ FILTRO POR TAMAÑO
    if (filters.size || minMetrajeParam || maxMetrajeParam) {
      let minMetraje = null;
      let maxMetraje = null;
      
      if (minMetrajeParam) {
        minMetraje = parseFloat(minMetrajeParam);
      }
      if (maxMetrajeParam) {
        maxMetraje = parseFloat(maxMetrajeParam);
      }
      
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
      
      if (minMetraje !== null || maxMetraje !== null) {
        const TOLERANCIA = 3;
        
        bodegasValidas = bodegasValidas.filter(bodega => {
          const metraje = parseFloat(bodega.metraje);
          if (isNaN(metraje)) return true;
          
          let cumple = true;
          if (minMetraje !== null && maxMetraje !== null) {
            cumple = metraje >= (minMetraje - TOLERANCIA) && metraje <= (maxMetraje + TOLERANCIA);
          } else if (minMetraje !== null) {
            cumple = metraje >= (minMetraje - TOLERANCIA);
          } else if (maxMetraje !== null) {
            cumple = metraje <= (maxMetraje + TOLERANCIA);
          }
          
          return cumple;
        });
        
        
        if (bodegasValidas.length === 0) return false;
      }
    }

    // ✅ FILTRO POR CARACTERÍSTICAS
    if (filters.features && filters.features.length > 0) {
      
      bodegasValidas = bodegasValidas.filter(bodega => {
        return filters.features.some(feature => {
          const featureNorm = normalizarTexto(feature);
          
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

    // ✅ FILTRO POR CALIFICACIÓN
    if (filters.rating > 0) {
      const rating = parseFloat(warehouse.rating) || 0;
      if (rating < (filters.rating - 0.5)) {
        return false;
      }
    }

    warehouse.miniBodegas = bodegasValidas;
    warehouse.totalBodegas = bodegasValidas.length;

    return true;
  }

  // ✅ FILTRADO PRINCIPAL - SIN ZONA OBLIGATORIA
  useEffect(() => {
    
    if (!warehouses || warehouses.length === 0) {
      setFilteredWarehouses([]);
      return;
    }
    
    const warehousesCopy = JSON.parse(JSON.stringify(warehouses));
    
    let filtered = warehousesCopy
      .map(warehouse => {
        let filteredWarehouse = { ...warehouse };
        let bodegasFiltradas = [...(warehouse.miniBodegas || [])];
        
        // ✅ FILTRO DE CIUDAD (OBLIGATORIO SI ESTÁ EN URL)
        if (ciudadSeleccionada) {
          const ciudadBusquedaNorm = normalizarTexto(ciudadSeleccionada);
          
          bodegasFiltradas = bodegasFiltradas.filter(bodega => {
            if (!bodega.ciudad) {
              return false;
            }
            
            const ciudadBodegaNorm = normalizarTexto(bodega.ciudad);
            const cumple = ciudadBodegaNorm.includes(ciudadBusquedaNorm) || 
                   ciudadBusquedaNorm.includes(ciudadBodegaNorm);
            
            return cumple;
          });
          
          
          if (bodegasFiltradas.length === 0) {
            return null;
          }
          
          filteredWarehouse.miniBodegas = bodegasFiltradas;
          filteredWarehouse.totalBodegas = bodegasFiltradas.length;
          
          const precios = bodegasFiltradas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p));
          filteredWarehouse.priceRange = precios.length > 0 ? {
            min: Math.min(...precios),
            max: Math.max(...precios)
          } : { min: 0, max: 0 };
        }
        
        // ✅ FILTRO DE ZONA (OPCIONAL - solo si está en URL Y la bodega tiene zona)
        if (zonaSeleccionada) {
          const zonaBusquedaNorm = normalizarTexto(zonaSeleccionada);
          
          // Solo filtrar bodegas que SÍ tienen zona
          const bodegasConZona = filteredWarehouse.miniBodegas.filter(bodega => bodega.zona);
          
          
          if (bodegasConZona.length > 0) {
            bodegasFiltradas = bodegasConZona.filter(bodega => {
              const zonaBodegaNorm = normalizarTexto(bodega.zona);
              const cumple = zonaBodegaNorm.includes(zonaBusquedaNorm) || 
                     zonaBusquedaNorm.includes(zonaBodegaNorm);
              
              return cumple;
            });
            
            // Si hay bodegas con zona que coinciden, usar solo esas
            if (bodegasFiltradas.length > 0) {
              filteredWarehouse.miniBodegas = bodegasFiltradas;
              filteredWarehouse.totalBodegas = bodegasFiltradas.length;
            } else {
            }
            // Si no hay coincidencias pero sí bodegas sin zona, mantener todas
          } else {
          }
          // Si no hay bodegas con zona, mantener todas (las que no tienen zona)
          
          const precios = filteredWarehouse.miniBodegas.map(b => parseFloat(b.precio_mensual)).filter(p => !isNaN(p));
          filteredWarehouse.priceRange = precios.length > 0 ? {
            min: Math.min(...precios),
            max: Math.max(...precios)
          } : { min: 0, max: 0 };
        }
        
        // ✅ FILTRO POR EMPRESA
        if (empresaSeleccionada) {
          const empresaBusquedaNorm = normalizarTexto(empresaSeleccionada);
          const nombreEmpresaNorm = normalizarTexto(warehouse.name);
          
          if (!nombreEmpresaNorm.includes(empresaBusquedaNorm) && 
              !empresaBusquedaNorm.includes(nombreEmpresaNorm)) {
            return null;
          }
        }
        
        return filteredWarehouse;
      })
      .filter(Boolean);
    
    
    // Aplicar filtros del sidebar
    filtered = filtered.filter(aplicarFiltros);
    
    filtered.forEach((w, i) => {
    });
    
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

  // ✅ GENERAR TÍTULO DINÁMICO
  const generarTitulo = () => {
    const partes = []
    if (empresaSeleccionada) partes.push(empresaSeleccionada)
    if (zonaSeleccionada) partes.push(zonaSeleccionada)  
    if (ciudadSeleccionada) partes.push(ciudadSeleccionada)
    
    let tamaño = '';
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