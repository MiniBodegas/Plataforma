// hooks/useCompletarFormulario.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export function useCompletarFormulario() {
  const { user, setUserTypeManually } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    descripcion: "",
    telefono: "",
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
          ciudad: empresa.ciudad || "",
          direccionPrincipal: empresa.direccion_principal || "",
          nombreRepresentante: empresa.nombre_representante || "",
          celular: empresa.celular || ""
        });

        await verificarArchivosExistentes(empresa.id);
      }
    } catch (error) {
      console.log('No se encontró empresa existente');
    }
  };

  const verificarArchivosExistentes = async (empresaId) => {
    try {
      const [camaraResult, rutResult] = await Promise.all([
        supabase.storage.from('documentos-empresas').list(`${empresaId}/camara-comercio`),
        supabase.storage.from('documentos-empresas').list(`${empresaId}/rut`)
      ]);

      setArchivosExistentes({
        camaraComercio: camaraResult.data?.length > 0 ? camaraResult.data[0] : null,
        rut: rutResult.data?.length > 0 ? rutResult.data[0] : null
      });
    } catch (error) {
      console.error('Error verificando archivos existentes:', error);
    }
  };

  const validarFormulario = () => {
    const errores = [];
    const campos = [
      { campo: 'nombreEmpresa', mensaje: 'El nombre de la empresa es obligatorio' },
      { campo: 'descripcion', mensaje: 'La descripción es obligatoria' },
      { campo: 'ciudad', mensaje: 'La ciudad es obligatoria' },
      { campo: 'direccionPrincipal', mensaje: 'La dirección principal es obligatoria' },
      { campo: 'nombreRepresentante', mensaje: 'El nombre del representante es obligatorio' },
      { campo: 'celular', mensaje: 'El celular es obligatorio' }
    ];

    campos.forEach(({ campo, mensaje }) => {
      if (!formData[campo].trim()) errores.push(mensaje);
    });

    // Validar documentos
    if (!empresaExistente) {
      if (!archivos.camaraComercio) errores.push('La Cámara de Comercio es obligatoria');
      if (!archivos.rut) errores.push('El RUT es obligatorio');
    } else {
      if (!archivosExistentes.camaraComercio && !archivos.camaraComercio) {
        errores.push('La Cámara de Comercio es obligatoria');
      }
      if (!archivosExistentes.rut && !archivos.rut) {
        errores.push('El RUT es obligatorio');
      }
    }

    if (errores.length > 0) {
      setError(errores[0]);
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
      let rutaCamaraComercio = empresaExistente?.camara_comercio || null;
      let rutaRut = empresaExistente?.rut || null;

      const empresaData = {
        nombre: formData.nombreEmpresa.trim(),
        descripcion: formData.descripcion.trim(),
        telefono: formData.telefono.trim() || null,
        email: user.email,
        ciudad: formData.ciudad.trim(),
        direccion_principal: formData.direccionPrincipal.trim(),
        nombre_representante: formData.nombreRepresentante.trim(),
        celular: formData.celular.trim(),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (empresaExistente) {
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', empresaExistente.id);
        if (error) throw error;
      } else {
        empresaData.created_at = new Date().toISOString();
        empresaData.rating = "0.0";
        
        const { data: nuevaEmpresa, error } = await supabase
          .from('empresas')
          .insert([empresaData])
          .select()
          .single();
          
        if (error) throw error;
        empresaId = nuevaEmpresa.id;
        setUserTypeManually('proveedor');
      }

      // Subir archivos si hay nuevos
      if (archivos.camaraComercio) {
        const { subirArchivo } = await import('../utils/archivoUtils');
        rutaCamaraComercio = await subirArchivo(archivos.camaraComercio, empresaId, 'camara-comercio', setUploadProgress);
      }

      if (archivos.rut) {
        const { subirArchivo } = await import('../utils/archivoUtils');
        rutaRut = await subirArchivo(archivos.rut, empresaId, 'rut', setUploadProgress);
      }

      // Actualizar rutas de documentos
      if (rutaCamaraComercio || rutaRut) {
        const documentosUpdate = {};
        if (rutaCamaraComercio) documentosUpdate.camara_comercio = rutaCamaraComercio;
        if (rutaRut) documentosUpdate.rut = rutaRut;

        const { error: updateError } = await supabase
          .from('empresas')
          .update(documentosUpdate)
          .eq('id', empresaId);

        if (updateError) throw new Error('Error guardando referencias de documentos');
      }

      navigate('/perfil-proveedor');
      
    } catch (error) {
      setError(error.message || 'Error al guardar la información. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (tipo, file) => {
    if (!file) return;

    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      setError(`Solo se permiten archivos PDF, JPG, JPEG o PNG para ${tipo}`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`El archivo de ${tipo} no puede superar 5MB`);
      return;
    }

    setArchivos(prev => ({ ...prev, [tipo]: file }));
    setError("");
  };

  return {
    formData,
    archivos,
    archivosExistentes,
    loading,
    uploadProgress,
    error,
    empresaExistente,
    user,
    handleSubmit,
    handleInputChange,
    handleFileChange,
    verificarArchivosExistentes
  };
}