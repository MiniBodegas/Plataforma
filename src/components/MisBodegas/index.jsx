import { useState } from 'react';
import { useBodegasByEmpresa } from '../../hooks/useBodegasByEmpresa';
import { BodegaCard } from './BodegaCard';
import { BodegaFilters } from './BodegaFilters';
import { BodegaStats } from './BodegaStats';
import { EditBodegaModal } from './EditBodegaModal';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

export function MisBodegas() {
  const { bodegas, loading, error, refetch } = useBodegasByEmpresa();
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState(null);
  const { toast, showOk, showError } = useToast();
  const [filtros, setFiltros] = useState({
    estado: 'todos',
    ciudad: 'todas',
    busqueda: ''
  });

  const handleStatusChange = async (bodegaId, nuevoEstado) => {
    try {
      console.log(`🔄 Intentando actualizar bodega ${bodegaId} a estado: ${nuevoEstado}`);
      
      const { data, error } = await supabase
        .from('mini_bodegas')
        .update({ estado: nuevoEstado })
        .eq('id', bodegaId);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }

      console.log('✅ Actualización exitosa:', data);
      showOk(`Estado cambiado a: ${nuevoEstado}`);
      
      // Esperar un poco y luego refetch
      setTimeout(async () => {
        await refetch();
        console.log('🔄 Refetch completado');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      showError(`Error: ${error.message}`);
    }
  };

  // Simplified filtering without unused fields
  const bodegasFiltradas = bodegas.filter(bodega => {
    const cumpleEstado = filtros.estado === 'todos' || bodega.estado === filtros.estado;
    const cumpleBusqueda = !filtros.busqueda || 
      String(bodega.metraje).includes(filtros.busqueda) ||
      bodega.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase());

    return cumpleEstado && cumpleBusqueda;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3A61]"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-600 p-4 text-center">
      Error: {error}
      <button 
        onClick={refetch}
        className="ml-4 text-[#2C3A61] hover:underline"
      >
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-[#2C3A61] mb-6">
        Gestión de Mini Bodegas
      </h2>

      <BodegaStats bodegas={bodegas} />
      
      {/* Simplified filters without sede and ciudad */}
      <BodegaFilters 
        bodegas={bodegas}
        filtros={filtros}
        onChange={setFiltros}
      />

      <div className="space-y-4">
        {bodegasFiltradas.length > 0 ? (
          bodegasFiltradas.map(bodega => (
            <BodegaCard
              key={bodega.id}
              bodega={{
                ...bodega,
                // Format fields for display
                metraje: bodega.metraje || 'N/A',
                descripcion: bodega.descripcion || 'Sin descripción',
                estado: bodega.estado || 'activa'
              }}
              onEdit={() => setBodegaSeleccionada(bodega)}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No se encontraron bodegas con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Modal and toast remain the same */}
      {bodegaSeleccionada && (
        <EditBodegaModal
          bodega={bodegaSeleccionada}
          onClose={() => setBodegaSeleccionada(null)}
          onSaved={async () => {
            console.log('🔄 Iniciando actualización de datos...');
            
            // Primero mostrar mensaje
            showOk('Bodega actualizada exitosamente');
            
            // Luego hacer refetch
            try {
              await refetch();
              console.log('✅ Datos actualizados correctamente');
            } catch (error) {
              console.error('❌ Error al actualizar datos:', error);
              showError('Error al actualizar la vista');
            }
            
            // Finalmente cerrar modal
            setBodegaSeleccionada(null);
          }}
        />
      )}

      {toast.msg && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}