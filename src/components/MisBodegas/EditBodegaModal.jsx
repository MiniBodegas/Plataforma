import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function EditBodegaModal({ bodega, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre_personalizado: '',
    metraje: '',
    descripcion: '',
    precio_mensual: '',
    ciudad: '',
    ubicacion_interna: '',
    metros_cuadrados: '',
    caracteristicas: [],
    cantidad: 1
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Poblar el form con los datos de la bodega cuando se abre el modal
  useEffect(() => {
    if (bodega) {
      console.log('📋 Poblando form con datos de bodega:', bodega);
      setForm({
        nombre_personalizado: bodega.nombre_personalizado || '',
        metraje: bodega.metraje || '',
        descripcion: bodega.descripcion || '',
        precio_mensual: bodega.precio_mensual || '',
        ciudad: bodega.ciudad || '',
        ubicacion_interna: bodega.ubicacion_interna || '',
        metros_cuadrados: bodega.metros_cuadrados || '',
        caracteristicas: Array.isArray(bodega.caracteristicas) ? bodega.caracteristicas : [],
        cantidad: bodega.cantidad || 1
      });
    }
  }, [bodega]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Cambiando ${name}: ${value}`);
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaracteristicas = (caracteristica) => {
    setForm(prev => {
      const nuevasCaracteristicas = prev.caracteristicas.includes(caracteristica)
        ? prev.caracteristicas.filter(c => c !== caracteristica)
        : [...prev.caracteristicas, caracteristica];
      
      console.log(`🏷️ Características actualizadas:`, nuevasCaracteristicas);
      
      return {
        ...prev,
        caracteristicas: nuevasCaracteristicas
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      console.log('🔄 Actualizando bodega:', bodega.id);
      console.log('📝 Datos originales:', bodega);
      console.log('📝 Datos del formulario:', form);

      const updateData = {
        nombre_personalizado: form.nombre_personalizado || null,
        metraje: form.metraje || null,
        descripcion: form.descripcion || null,
        precio_mensual: parseFloat(form.precio_mensual) || 0,
        ciudad: form.ciudad || null,
        ubicacion_interna: form.ubicacion_interna || null,
        metros_cuadrados: form.metros_cuadrados || null,
        caracteristicas: form.caracteristicas || [],
        cantidad: parseInt(form.cantidad) || 1
      };

      console.log('📝 Datos a enviar a DB:', updateData);

      const { data, error: updateError } = await supabase
        .from('mini_bodegas')
        .update(updateData)
        .eq('id', bodega.id)
        .select();

      if (updateError) {
        console.error('❌ Error de actualización:', updateError);
        throw updateError;
      }

      console.log('✅ Actualización exitosa:', data);
      
      // Llamar onSaved que debería hacer refetch
      onSaved();
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const CARACTERISTICAS_DEFAULT = [
    "Acceso 24/7",
    "Seguridad",
    "Climatizado",
    "Primer piso",
    "Luz incluida"
  ];

  // Debug: mostrar datos actuales
  console.log('🔍 Datos actuales del form:', form);
  console.log('🔍 Bodega recibida:', bodega);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-[#2C3A61] mb-6">
          Editar Mini Bodega
          <span className="text-sm font-normal text-gray-500 block">
            ID: {bodega?.id}
          </span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre personalizado
              <span className="text-xs text-gray-500 ml-2">
                (Actual: {bodega?.nombre_personalizado || 'Sin nombre'})
              </span>
            </label>
            <input
              type="text"
              name="nombre_personalizado"
              value={form.nombre_personalizado}
              onChange={handleChange}
              placeholder={bodega?.nombre_personalizado || 'Ingrese nombre personalizado'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Metraje y Metros cuadrados */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metraje
                <span className="text-xs text-gray-500 ml-2">
                  (Actual: {bodega?.metraje || 'No definido'})
                </span>
              </label>
              <input
                type="number"
                name="metraje"
                value={form.metraje}
                onChange={handleChange}
                placeholder={bodega?.metraje || '0'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metros cuadrados
                <span className="text-xs text-gray-500 ml-2">
                  (Actual: {bodega?.metros_cuadrados || 'No definido'})
                </span>
              </label>
              <input
                type="number"
                name="metros_cuadrados"
                value={form.metros_cuadrados}
                onChange={handleChange}
                placeholder={bodega?.metros_cuadrados || '0'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
              <span className="text-xs text-gray-500 ml-2">
                (Actual: {bodega?.descripcion || 'Sin descripción'})
              </span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder={bodega?.descripcion || 'Ingrese descripción'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Precio mensual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio mensual
              <span className="text-xs text-gray-500 ml-2">
                (Actual: ${Number(bodega?.precio_mensual || 0).toLocaleString()})
              </span>
            </label>
            <input
              type="number"
              name="precio_mensual"
              value={form.precio_mensual}
              onChange={handleChange}
              placeholder={bodega?.precio_mensual || '0'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Ciudad y Ubicación interna */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
                <span className="text-xs text-gray-500 ml-2">
                  (Actual: {bodega?.ciudad || 'No definida'})
                </span>
              </label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                placeholder={bodega?.ciudad || 'Ingrese ciudad'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación interna
                <span className="text-xs text-gray-500 ml-2">
                  (Actual: {bodega?.ubicacion_interna || 'No definida'})
                </span>
              </label>
              <input
                type="text"
                name="ubicacion_interna"
                value={form.ubicacion_interna}
                onChange={handleChange}
                placeholder={bodega?.ubicacion_interna || 'Ej: Piso 2, Sección A'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
              <span className="text-xs text-gray-500 ml-2">
                (Actual: {bodega?.cantidad || 1})
              </span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              min="1"
              placeholder={bodega?.cantidad || '1'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Características
              <span className="text-xs text-gray-500 ml-2">
                (Actuales: {bodega?.caracteristicas?.length || 0} seleccionadas)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CARACTERISTICAS_DEFAULT.map((caracteristica) => (
                <label
                  key={caracteristica}
                  className={`px-3 py-1 rounded-full border cursor-pointer text-sm transition-colors ${
                    form.caracteristicas.includes(caracteristica)
                      ? 'bg-[#2C3A61] text-white border-[#2C3A61]'
                      : 'bg-white text-[#2C3A61] border-[#2C3A61] hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.caracteristicas.includes(caracteristica)}
                    onChange={() => handleCaracteristicas(caracteristica)}
                  />
                  {caracteristica}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#2C3A61] hover:bg-[#1d2742]'
              } text-white`}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}