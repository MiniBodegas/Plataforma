import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const opciones = [
  {
    nombre: "Mi perfil",
    tipo: "ruta",
    ruta: "/completar-formulario-proveedor",
  },
  {
    nombre: "Documentos oficiales",
    tipo: "documentos",
  },
  {
    nombre: "Configuración de pagos",
    tipo: "desplegable",
    contenido: (
      <div className="p-4 text-gray-600">
        Métodos de pago registrados: <br />- Tarjeta Visa terminación 1234
      </div>
    ),
  },
  {
    nombre: "Planes y facturación",
    tipo: "ruta",
    ruta: "",
  },
  {
    nombre: "Centro de ayuda",
    tipo: "desplegable",
    contenido: (
      <div className="p-4 text-gray-600">
        ¿Necesitas ayuda? Escríbenos a soporte@minibodegas.com o llama al 123456789.
      </div>
    ),
  },
];

export function PerfilProveedor() {
  const [open, setOpen] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const BUCKET = 'documentos-empresas';

  useEffect(() => {
    if (authLoading) return;
    if (!authLoading && !user) {
      navigate('/home-proveedor');
      return;
    }
    if (user) {
      cargarEmpresa();
    }
  }, [user, authLoading]);

  const cargarEmpresa = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setEmpresa(empresaData);
    } catch (error) {
      setEmpresa(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (idx, opcion) => {
    if (opcion.tipo === "ruta") {
      navigate(opcion.ruta);
    } else {
      setOpen(open === idx ? null : idx);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/home-proveedor');
  };

  const isValidFile = (file) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    const max = 6 * 1024 * 1024;
    return allowed.includes(file.type) && file.size <= max;
  };

  const handleUploadDocumento = async (type, file) => {
    if (!empresa || !file || !user) return;
    if (!isValidFile(file)) {
      setUploadError('Archivo inválido (PDF/JPG/PNG, ≤6MB).');
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      // Estructura: empresa_id/tipo_documento/timestamp_nombrearchivo
      const folder = type === 'rut' ? 'rut' : 'camara_comercio';
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${empresa.id}/${folder}/${fileName}`;
      
      console.log('Subiendo archivo a:', filePath);

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Guardar solo el filePath en la base de datos
      const updates = { updated_at: new Date().toISOString() };
      if (type === 'rut') updates.rut = filePath;
      if (type === 'camara') updates.camara_comercio = filePath;

      const { data: empresaUpdated, error: updateErr } = await supabase
        .from('empresas')
        .update(updates)
        .eq('id', empresa.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      setEmpresa(empresaUpdated);
      setUploadError(null);
      console.log('Documento subido exitosamente:', filePath);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error subiendo documento');
    } finally {
      setUploading(false);
    }
  };

  const getSignedUrl = async (filePath) => {
    if (!filePath) return null;

    // Si es una URL completa (datos antiguos), retornarla directamente
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log('Es URL completa:', filePath);
      return filePath;
    }

    // Si es un path relativo, generar signed URL
    try {
      console.log('Generando signed URL para:', filePath);
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(filePath, 3600); // 1 hora de validez

      if (error) {
        console.error('Error en createSignedUrl:', error);
        throw error;
      }

      console.log('Signed URL generada:', data.signedUrl);
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  };

  const handleViewDocument = async (filePath) => {
    console.log("Intentando ver documento:", filePath);
    
    if (!filePath) {
      setUploadError('No hay documento para mostrar');
      return;
    }

    const url = await getSignedUrl(filePath);
    if (url) {
      console.log('Abriendo URL:', url);
      window.open(url, '_blank');
    } else {
      setUploadError('Error al cargar el documento. Verifica que el archivo existe.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#2C3A61]">
          <div className="w-6 h-6 border-2 border-[#2C3A61] border-t-transparent rounded-full animate-spin"></div>
          {authLoading ? 'Verificando sesión...' : 'Cargando perfil...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="px-6 py-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#2C3A61] mb-2">
            {empresa?.nombre_representante || "Representante Legal"}
          </h2>
          <h3 className="text-xl font-bold text-[#2C3A61] mb-2">
            {empresa?.nombre || "Empresa"}
          </h3>
          <h4 className="text-lg text-[#2C3A61]">
            Mi cuenta
          </h4>
        </div>

        {/* Opciones del menú */}
        <div className="space-y-4 mb-4 flex-1">
          {opciones.map((opcion, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => handleClick(idx, opcion)}
                className="w-full p-4 bg-white hover:bg-gray-50 flex items-center justify-between text-left"
              >
                <span className="text-[#2C3A61] font-medium">{opcion.nombre}</span>
                {(opcion.tipo === "desplegable" || opcion.tipo === "documentos") && (
                  <svg
                    className={`w-5 h-5 text-[#2C3A61] transition-transform ${
                      open === idx ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {opcion.tipo === "desplegable" && open === idx && (
                <div className="bg-gray-50 border-t border-gray-200">
                  {opcion.contenido}
                </div>
              )}

              {opcion.tipo === "documentos" && open === idx && (
                <div className="bg-gray-50 border-t border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Sube RUT y Cámara de Comercio. Solo PDF/JPG/PNG. Máx 6MB.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                      {empresa?.rut ? (
                        <button
                          onClick={() => handleViewDocument(empresa.rut)}
                          className="text-blue-600 hover:underline text-sm block mb-2"
                        >
                          Ver documento actual
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">No subido</p>
                      )}
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => handleUploadDocumento('rut', e.target.files?.[0])}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#2C3A61] file:text-white hover:file:bg-[#1a2438] disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cámara de Comercio</label>
                      {empresa?.camara_comercio ? (
                        <button
                          onClick={() => handleViewDocument(empresa.camara_comercio)}
                          className="text-blue-600 hover:underline text-sm block mb-2"
                        >
                          Ver documento actual
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">No subido</p>
                      )}
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => handleUploadDocumento('camara', e.target.files?.[0])}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#2C3A61] file:text-white hover:file:bg-[#1a2438] disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {uploadError && <p className="text-red-600 text-sm mt-3">{uploadError}</p>}
                  {uploading && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-3">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      Subiendo documento...
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}