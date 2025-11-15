// src/components/Admin/CaracteristicasTab.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export function CaracteristicasTab() {
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('general');
  const [esObligatoria, setEsObligatoria] = useState(false);

  // Cargar características
  const loadCaracteristicas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supaError } = await supabase
        .from('caracteristicas')
        .select('*')
        .order('created_at', { ascending: false });

      if (supaError) throw supaError;
      setCaracteristicas(data || []);
    } catch (err) {
      console.error(err);
      setError('Error cargando características');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaracteristicas();
  }, []);

  // Crear nueva característica
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const { error: supaError } = await supabase
        .from('caracteristicas')
        .insert([
          {
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            categoria,
            es_obligatoria: esObligatoria,
            activo: true,
          },
        ]);

      if (supaError) throw supaError;

      setNombre('');
      setDescripcion('');
      setCategoria('general');
      setEsObligatoria(false);

      await loadCaracteristicas();
    } catch (err) {
      console.error(err);
      setError('Error creando la característica');
    } finally {
      setSaving(false);
    }
  };

  // Toggle activo / inactivo
  const toggleActivo = async (caracteristica) => {
    try {
      const { error: supaError } = await supabase
        .from('caracteristicas')
        .update({ activo: !caracteristica.activo })
        .eq('id', caracteristica.id);

      if (supaError) throw supaError;
      await loadCaracteristicas();
    } catch (err) {
      console.error(err);
      setError('Error actualizando la característica');
    }
  };

  // Borrar
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta característica?')) return;
    try {
      const { error: supaError } = await supabase
        .from('caracteristicas')
        .delete()
        .eq('id', id);

      if (supaError) throw supaError;
      await loadCaracteristicas();
    } catch (err) {
      console.error(err);
      setError('Error eliminando la característica');
    }
  };

  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Características</h1>
        <p className="text-sm text-gray-600">
          Define las características que los usuarios podrán seleccionar al crear sus reservas / bodegas.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario para crear nueva característica */}
      <form 
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva característica
          </h2>
          {saving && (
            <span className="text-xs text-gray-500">Guardando...</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Altura máxima, Tipo de acceso, etc."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="general">General</option>
              <option value="bodega">Bodega</option>
              <option value="seguridad">Seguridad</option>
              <option value="acceso">Acceso</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Explica brevemente qué significa esta característica para el usuario."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Obligatoria */}
        <div className="flex items-center gap-2">
          <input
            id="esObligatoria"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            checked={esObligatoria}
            onChange={(e) => setEsObligatoria(e.target.checked)}
          />
          <label htmlFor="esObligatoria" className="text-sm text-gray-700">
            Esta característica es obligatoria en los formularios de usuario
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Agregar característica
          </button>
        </div>
      </form>

      {/* Lista de características */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">
            Características creadas
          </h2>
          {loading && (
            <span className="text-xs text-gray-500">Cargando...</span>
          )}
        </div>

        {caracteristicas.length === 0 && !loading ? (
          <div className="px-4 py-6 text-sm text-gray-500">
            No hay características creadas todavía.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {caracteristicas.map((car) => (
              <li key={car.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {car.nombre}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {car.categoria || 'general'}
                    </span>
                    {car.es_obligatoria && (
                      <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        Obligatoria
                      </span>
                    )}
                  </div>
                  {car.descripcion && (
                    <p className="mt-1 text-xs text-gray-600">
                      {car.descripcion}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-gray-400">
                    ID: {car.id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActivo(car)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${
                      car.activo
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}
                  >
                    {car.activo ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Inactivo
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(car.id)}
                    className="inline-flex items-center justify-center p-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
