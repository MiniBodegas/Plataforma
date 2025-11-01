export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'activa':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inhabilitada':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'ocupada':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getEstadoTexto = (estado) => {
  switch (estado) {
    case 'activa':
      return 'Activa';
    case 'inhabilitada':
      return 'Inhabilitada';
    case 'ocupada':
      return 'Ocupada';
    case 'mantenimiento':
      return 'Mantenimiento';
    default:
      return 'Sin estado';
  }
};

export const handleCambiarEstado = async (bodegaId, nuevoEstado, supabase) => {
  try {
    const { error } = await supabase
      .from('mini_bodegas')
      .update({ estado: nuevoEstado })
      .eq('id', bodegaId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return { 
      success: false, 
      error: 'No se pudo cambiar el estado de la bodega'
    };
  }
};

export const formatPrecio = (precio) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(precio);
};

export const getMetrajeText = (bodega) => {
  if (!bodega.metraje) return '';
  return `${bodega.metraje}${bodega.metros_cuadrados ? ' m²' : ''}`;
};