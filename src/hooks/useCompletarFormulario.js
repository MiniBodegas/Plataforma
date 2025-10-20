// hooks/useCompletarFormulario.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export function useCompletarFormulario() {
  const { user, setUserTypeManually } = useAuth();
  const navigate = useNavigate();

  // Estado inicial SEGURO: todos los campos en string
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    descripcion: "",
    telefono: "",
    ciudad: "",
    direccionPrincipal: "",
    correo_contacto: "",
    nit: "",
    pais: "",
  
  });

  const [archivos, setArchivos] = useState({
    camaraComercio: null,
    rut: null,
  });

  const [archivosExistentes, setArchivosExistentes] = useState({
    camaraComercio: null,
    rut: null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState("");
  const [empresaExistente, setEmpresaExistente] = useState(null);

  useEffect(() => {
    verificarEmpresaExistente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const verificarEmpresaExistente = async () => {
    if (!user) return;

    try {
      const { data: empresa, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (empresa) {
        setEmpresaExistente(empresa);

        // HIDRATACIÓN ÚNICA + NORMALIZACIÓN (evita undefined/null)
        setFormData((prev) => ({
          ...prev,
          nombreEmpresa: empresa.nombre || "",
          descripcion: empresa.descripcion || "",
          telefono: empresa.telefono || "",
          ciudad: empresa.ciudad || "",
          direccionPrincipal: empresa.direccion_principal || "",
          correo_contacto: empresa.correo_contacto || "", // <- clave
          nit: empresa.nit || "",
          pais: empresa.pais || "",
        }));

        await verificarArchivosExistentes(empresa.id);
      } else {
        setEmpresaExistente(null);
      }
    } catch (err) {
      console.log("No se encontró empresa existente");
      setEmpresaExistente(null);
    }
  };

  const verificarArchivosExistentes = async (empresaId) => {
    try {
      const [camaraResult, rutResult] = await Promise.all([
        supabase.storage
          .from("documentos-empresas")
          .list(`${empresaId}/camara-comercio`),
        supabase.storage
          .from("documentos-empresas")
          .list(`${empresaId}/rut`),
      ]);

      setArchivosExistentes({
        camaraComercio:
          camaraResult.data?.length > 0 ? camaraResult.data[0] : null,
        rut: rutResult.data?.length > 0 ? rutResult.data[0] : null,
      });
    } catch (error) {
      console.error("Error verificando archivos existentes:", error);
    }
  };

  const validarFormulario = () => {
    const errores = [];
    const campos = [
      { campo: "nombreEmpresa", mensaje: "El nombre de la empresa es obligatorio" },
      { campo: "descripcion", mensaje: "La descripción es obligatoria" },
      { campo: "ciudad", mensaje: "La ciudad es obligatoria" },
      { campo: "direccionPrincipal", mensaje: "La dirección principal es obligatoria" },
      { campo: "correo_contacto", mensaje: "El correo de contacto es obligatorio" },
    ];

    campos.forEach(({ campo, mensaje }) => {
      const v = (formData[campo] ?? "").toString().trim();
      if (!v) errores.push(mensaje);
    });

    // Validar documentos (si no hay empresa, ambos son obligatorios)
    if (!empresaExistente) {
      if (!archivos.camaraComercio) errores.push("La Cámara de Comercio es obligatoria");
      if (!archivos.rut) errores.push("El RUT es obligatorio");
    } else {
      if (!archivosExistentes.camaraComercio && !archivos.camaraComercio) {
        errores.push("La Cámara de Comercio es obligatoria");
      }
      if (!archivosExistentes.rut && !archivos.rut) {
        errores.push("El RUT es obligatorio");
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

      // Mapea tus columnas reales
      const empresaData = {
        nombre: (formData.nombreEmpresa ?? "").trim(),
        descripcion: (formData.descripcion ?? "").trim(),
        telefono: (formData.telefono ?? "").trim() || null,
        correo_contacto: (formData.correo_contacto ?? "").trim(), // <- guardado
        ciudad: (formData.ciudad ?? "").trim(),
        direccion_principal: (formData.direccionPrincipal ?? "").trim(),
        celular: (formData.celular ?? "").trim(),
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (empresaExistente) {
        const { error } = await supabase
          .from("empresas")
          .update(empresaData)
          .eq("id", empresaExistente.id);
        if (error) throw error;
      } else {
        empresaData.created_at = new Date().toISOString();
        empresaData.rating = "0.0";

        const { error } = await supabase
          .from("empresas")
          .insert([
            {
              ...formData,
              user_id: user.id,
              // celular: formData.celular, // ELIMINAR
            },
          ]);
        if (error) throw error;
        empresaId = nuevaEmpresa.id;
        setUserTypeManually("proveedor");
      }

      // Subir archivos si hay nuevos
      if (archivos.camaraComercio) {
        const { subirArchivo } = await import("../utils/archivoUtils");
        rutaCamaraComercio = await subirArchivo(
          archivos.camaraComercio,
          empresaId,
          "camara-comercio",
          setUploadProgress
        );
      }

      if (archivos.rut) {
        const { subirArchivo } = await import("../utils/archivoUtils");
        rutaRut = await subirArchivo(
          archivos.rut,
          empresaId,
          "rut",
          setUploadProgress
        );
      }

      // Actualiza referencias a documentos
      if (rutaCamaraComercio || rutaRut) {
        const documentosUpdate = {};
        if (rutaCamaraComercio) documentosUpdate.camara_comercio = rutaCamaraComercio;
        if (rutaRut) documentosUpdate.rut = rutaRut;

        const { error: updateError } = await supabase
          .from("empresas")
          .update(documentosUpdate)
          .eq("id", empresaId);

        if (updateError) throw new Error("Error guardando referencias de documentos");
      }

      navigate("/perfil-proveedor");
    } catch (err) {
      setError(err?.message || "Error al guardar la información. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (tipo, file) => {
    if (!file) return;

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!tiposPermitidos.includes(file.type)) {
      setError(`Solo se permiten archivos PDF, JPG, JPEG o PNG para ${tipo}`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`El archivo de ${tipo} no puede superar 5MB`);
      return;
    }

    setArchivos((prev) => ({ ...prev, [tipo]: file }));
    setError("");
  };

  return {
    formData,
    setFormData,
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
    verificarArchivosExistentes,
  };
}
