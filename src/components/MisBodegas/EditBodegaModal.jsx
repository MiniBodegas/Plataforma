import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function EditBodegaModal({ bodega, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombre_personalizado: bodega.nombre_personalizado || '',
    metraje: bodega.metraje || '',
    descripcion: bodega.descripcion || '',
    precio_mensual: bodega.precio_mensual || '',
    ciudad: bodega.ciudad || '',
    ubicacion_interna: bodega.ubicacion_interna || '',
    metros_cuadrados: bodega.metros_cuadrados || '',
    caracteristicas: bodega.caracteristicas || [],
    cantidad: bodega.cantidad || 1
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaracteristicas = (caracteristica) => {
    setForm(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.includes(caracteristica)
        ? prev.caracteristicas.filter(c => c !== caracteristica)
        : [...prev.caracteristicas, caracteristica]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('mini_bodegas')
        .update({
          nombre_personalizado: form.nombre_personalizado,
          metraje: form.metraje,
          descripcion: form.descripcion,
          precio_mensual: form.precio_mensual,
          ciudad: form.ciudad,
          ubicacion_interna: form.ubicacion_interna,
          metros_cuadrados: form.metros_cuadrados,
          caracteristicas: form.caracteristicas,
          cantidad: form.cantidad
        })
        .eq('id', bodega.id);

      if (updateError) throw updateError;
      
      onSaved();
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError('No se pudo actualizar la bodega');
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-[#2C3A61] mb-6">
          Editar Mini Bodega
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre personalizado
            </label>
            <input
              type="text"
              name="nombre_personalizado"
              value={form.nombre_personalizado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Metraje y Metros cuadrados */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metraje
              </label>
              <input
                type="number"
                name="metraje"
                value={form.metraje}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metros cuadrados
              </label>
              <input
                type="number"
                name="metros_cuadrados"
                value={form.metros_cuadrados}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Precio mensual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio mensual
            </label>
            <input
              type="number"
              name="precio_mensual"
              value={form.precio_mensual}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Ciudad y Ubicación interna */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación interna
              </label>
              <input
                type="text"
                name="ubicacion_interna"
                value={form.ubicacion_interna}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
              />
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C3A61] focus:border-[#2C3A61] outline-none"
            />
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Características
            </label>
            <div className="flex flex-wrap gap-2">
              {CARACTERISTICAS_DEFAULT.map((caracteristica) => (
                <label
                  key={caracteristica}
                  className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${
                    form.caracteristicas.includes(caracteristica)
                      ? 'bg-[#2C3A61] text-white border-[#2C3A61]'
                      : 'bg-white text-[#2C3A61] border-[#2C3A61]'
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
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
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