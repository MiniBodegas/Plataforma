import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export function CompletarFormularioProveedor() {
  const { user, setUserTypeManually } = useAuth(); // Agregar setUserTypeManually
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    descripcion: "",
    telefono: "",
    email: "",
    ciudad: "",
    direccionPrincipal: "",
    nombreRepresentante: "",
    celular: ""
  });
  
  const [archivos, setArchivos] = useState({
    camaraComercio: null,
    rut: null
  });

  const [archivosExistentes, setArchivosExistentes] = useState({
    camaraComercio: null,
    rut: null
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState("");
  const [empresaExistente, setEmpresaExistente] = useState(null);

  useEffect(() => {
    verificarEmpresaExistente();
  }, [user]);

  const verificarEmpresaExistente = async () => {
    if (!user) return;
    
    try {
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (empresa) {
        setEmpresaExistente(empresa);
        setFormData({
          nombreEmpresa: empresa.nombre || "",
          descripcion: empresa.descripcion || "",
          telefono: empresa.telefono || "",
          email: empresa.email || "",
          ciudad: empresa.ciudad || "",
          direccionPrincipal: empresa.direccion_principal || "",
          nombreRepresentante: empresa.nombre_representante || "",
          celular: empresa.celular || ""
        });

        // Verificar archivos existentes
        await verificarArchivosExistentes(empresa.id);
      }
    } catch (error) {
      console.log('No se encontró empresa existente');
    }
  };

  const descargarArchivo = async (empresaId, tipo, nombreArchivo) => {
    try {
      // Usar signed URL para acceso seguro a archivos privados
      const { data, error } = await supabase.storage
        .from('documentos-empresas')
        .createSignedUrl(`${empresaId}/${tipo}/${nombreArchivo}`, 60); // URL válida por 60 segundos

      if (error) throw error;

      // Crear un enlace temporal para descargar
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = nombreArchivo;
      a.target = '_blank'; // Abrir en nueva pestaña
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error descargando archivo:', error);
      setError('Error al descargar el archivo');
    }
  };

  // Función para obtener URL de vista previa (opcional)
  const obtenerUrlVistaPrevia = async (empresaId, tipo, nombreArchivo) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-empresas')
        .createSignedUrl(`${empresaId}/${tipo}/${nombreArchivo}`, 300); // 5 minutos

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error obteniendo vista previa:', error);
      return null;
    }
  };

  // Función mejorada para verificar archivos existentes
  const verificarArchivosExistentes = async (empresaId) => {
    try {
      // Verificar Cámara de Comercio
      const { data: camaraFiles, error: camaraError } = await supabase.storage
        .from('documentos-empresas')
        .list(`${empresaId}/camara-comercio`);

      // Verificar RUT
      const { data: rutFiles, error: rutError } = await supabase.storage
        .from('documentos-empresas')
        .list(`${empresaId}/rut`);

      if (camaraError) console.error('Error listando archivos camara:', camaraError);
      if (rutError) console.error('Error listando archivos rut:', rutError);

      setArchivosExistentes({
        camaraComercio: camaraFiles && camaraFiles.length > 0 ? camaraFiles[0] : null,
        rut: rutFiles && rutFiles.length > 0 ? rutFiles[0] : null
      });
    } catch (error) {
      console.error('Error verificando archivos existentes:', error);
    }
  };

  // Función mejorada para subir archivos con validación adicional
  const subirArchivo = async (file, empresaId, tipo) => {
    try {
      setUploadProgress(prev => ({ ...prev, [tipo]: 0 }));

      // Validaciones adicionales de seguridad
      const fileExt = file.name.split('.').pop().toLowerCase();
      const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!extensionesPermitidas.includes(fileExt)) {
        throw new Error(`Extensión de archivo no permitida: .${fileExt}`);
      }

      // Generar nombre único y seguro
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${tipo}-${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${empresaId}/${tipo}/${fileName}`;

      // Eliminar archivo anterior si existe
      if (archivosExistentes[tipo]) {
        try {
          await supabase.storage
            .from('documentos-empresas')
            .remove([`${empresaId}/${tipo}/${archivosExistentes[tipo].name}`]);
        } catch (deleteError) {
          console.warn('No se pudo eliminar archivo anterior:', deleteError);
        }
      }

      // Subir nuevo archivo
      const { data, error } = await supabase.storage
        .from('documentos-empresas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      setUploadProgress(prev => ({ ...prev, [tipo]: 100 }));
      
      // Actualizar la lista de archivos existentes
      await verificarArchivosExistentes(empresaId);
      
      return data.path;
    } catch (error) {
      console.error(`Error subiendo ${tipo}:`, error);
      setUploadProgress(prev => ({ ...prev, [tipo]: 0 }));
      throw new Error(`Error al subir ${tipo}: ${error.message}`);
    }
  };

  const validarFormulario = () => {
    if (!formData.nombreEmpresa.trim()) {
      setError('El nombre de la empresa es obligatorio');
      return false;
    }
    
    if (!formData.nombreRepresentante.trim()) {
      setError('El nombre del representante es obligatorio');
      return false;
    }
    
    if (!formData.celular.trim()) {
      setError('El celular es obligatorio');
      return false;
    }

    if (!formData.ciudad.trim()) {
      setError('La ciudad es obligatoria');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    setError("");

    try {
      let empresaId = empresaExistente?.id;

      const empresaData = {
        nombre: formData.nombreEmpresa.trim(),
        descripcion: formData.descripcion.trim() || null,
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim() || null,
        ciudad: formData.ciudad.trim(),
        direccion_principal: formData.direccionPrincipal.trim() || null,
        nombre_representante: formData.nombreRepresentante.trim(),
        celular: formData.celular.trim(),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (empresaExistente) {
        // Actualizar empresa existente
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', empresaExistente.id);
          
        if (error) throw error;
      } else {
        // Crear nueva empresa
        empresaData.created_at = new Date().toISOString();
        empresaData.rating = "0.0";
        
        const { data: nuevaEmpresa, error } = await supabase
          .from('empresas')
          .insert([empresaData])
          .select()
          .single();
          
        if (error) throw error;
        empresaId = nuevaEmpresa.id;

        // Establecer como proveedor cuando crea su primera empresa
        setUserTypeManually('proveedor');
      }

      // Subir archivos si hay nuevos
      const promesasArchivos = [];

      if (archivos.camaraComercio) {
        promesasArchivos.push(
          subirArchivo(archivos.camaraComercio, empresaId, 'camara-comercio')
        );
      }

      if (archivos.rut) {
        promesasArchivos.push(
          subirArchivo(archivos.rut, empresaId, 'rut')
        );
      }

      if (promesasArchivos.length > 0) {
        await Promise.all(promesasArchivos);
      }

      // Redirigir al perfil del proveedor
      navigate('/perfil-proveedor');
      
    } catch (error) {
      console.error('Error guardando empresa:', error);
      setError(error.message || 'Error al guardar la información. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Agregar esta función al componente para mostrar el estado de los documentos
  const DocumentoEstado = ({ tipo, archivo, empresaId }) => {
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [cargandoVista, setCargandoVista] = useState(false);

    const mostrarVistaPrevia = async () => {
      if (!archivo || cargandoVista) return;
      
      setCargandoVista(true);
      try {
        const url = await obtenerUrlVistaPrevia(empresaId, tipo, archivo.name);
        if (url) {
          setVistaPrevia(url);
          // Auto-cerrar vista previa después de 4 minutos (antes de que expire)
          setTimeout(() => setVistaPrevia(null), 240000);
        }
      } catch (error) {
        console.error('Error mostrando vista previa:', error);
      } finally {
        setCargandoVista(false);
      }
    };

    if (!archivo) return null;

    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Documento actual:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={mostrarVistaPrevia}
              disabled={cargandoVista}
              className="text-[#4B799B] hover:underline text-sm disabled:opacity-50"
            >
              {cargandoVista ? 'Cargando...' : 'Vista previa'}
            </button>
            <button
              type="button"
              onClick={() => descargarArchivo(empresaId, tipo, archivo.name)}
              className="text-[#4B799B] hover:underline text-sm"
            >
              Descargar
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-800 mb-2">{archivo.name}</p>
        <p className="text-xs text-gray-500">
          Subido: {new Date(archivo.created_at || archivo.updated_at).toLocaleDateString()}
        </p>
        
        {vistaPrevia && (
          <div className="mt-3">
            <iframe
              src={vistaPrevia}
              className="w-full h-40 border border-gray-200 rounded"
              title={`Vista previa ${tipo}`}
            />
            <button
              onClick={() => setVistaPrevia(null)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              Cerrar vista previa
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (tipo, file) => {
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        setError(`Solo se permiten archivos PDF, JPG, JPEG o PNG para ${tipo}`);
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`El archivo de ${tipo} no puede superar 5MB`);
        return;
      }

      setArchivos(prev => ({
        ...prev,
        [tipo]: file
      }));
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mb-6">
          {empresaExistente ? 'Actualizar Información de la Empresa' : 'Completar Información de la Empresa'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Para continuar como proveedor, necesitamos la información completa de tu empresa.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la empresa */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Información de la Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nombre de la empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={(e) => handleInputChange('nombreEmpresa', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Ingresa el nombre de tu empresa"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Ciudad donde opera la empresa"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Breve descripción de tu empresa"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Teléfono de la empresa
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Teléfono fijo de la empresa"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email de la empresa
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="email@empresa.com"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Dirección principal
                </label>
                <input
                  type="text"
                  value={formData.direccionPrincipal}
                  onChange={(e) => handleInputChange('direccionPrincipal', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Dirección principal de la empresa"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Información del representante legal */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Información del Representante Legal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nombre del representante legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombreRepresentante}
                  onChange={(e) => handleInputChange('nombreRepresentante', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Nombre completo del representante"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Celular <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 
                            focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                  placeholder="Número de celular"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div>
            <h3 className="text-lg font-semibold text-[#2C3A61] mb-4">Documentos Legales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cámara de Comercio */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Cámara de Comercio
                </label>
                {archivosExistentes.camaraComercio ? (
                  <DocumentoEstado 
                    tipo="camara-comercio" 
                    archivo={archivosExistentes.camaraComercio} 
                    empresaId={empresaExistente.id} 
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('camaraComercio', e.target.files[0])}
                      className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3
                                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG o PNG (máx. 5MB)</p>
                  </div>
                )}
                {uploadProgress.camaraComercio !== undefined && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#4B799B] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.camaraComercio}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Subiendo... {uploadProgress.camaraComercio}%</p>
                  </div>
                )}
              </div>

              {/* RUT */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  RUT
                </label>
                {archivosExistentes.rut ? (
                  <DocumentoEstado 
                    tipo="rut" 
                    archivo={archivosExistentes.rut} 
                    empresaId={empresaExistente.id} 
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('rut', e.target.files[0])}
                      className="w-full h-12 border border-gray-300 rounded-lg px-4 py-3
                                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG o PNG (máx. 5MB)</p>
                  </div>
                )}
                {uploadProgress.rut !== undefined && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#4B799B] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.rut}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Subiendo... {uploadProgress.rut}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#4B799B] hover:bg-blue-700 text-white font-semibold 
                      rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </div>
            ) : (
              empresaExistente ? 'Actualizar información' : 'Guardar información'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}