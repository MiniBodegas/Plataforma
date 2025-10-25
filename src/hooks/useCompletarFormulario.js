import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function useCompletarFormulario() {
  const { user, setUserTypeManually } = useAuth();

  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    descripcion: "",
    telefono: "",
    ciudad: "",
    direccionPrincipal: "",
    correo_contacto: "",
    sitio_web: "",
    celular: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [empresaExistente, setEmpresaExistente] = useState(null);

  // ✅ Verificar si ya existe una empresa registrada por este usuario
  useEffect(() => {
    if (user) verificarEmpresaExistente();
  }, [user]);

  const verificarEmpresaExistente = async () => {
    try {
      const { data: empresa, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (empresa) {
        setEmpresaExistente(empresa);
        setFormData({
          nombreEmpresa: empresa.nombre || "",
          descripcion: empresa.descripcion || "",
          telefono: empresa.telefono || "",
          ciudad: empresa.ciudad || "",
          direccionPrincipal: empresa.direccion_principal || "",
          correo_contacto: empresa.correo_contacto || "",
          sitio_web: empresa.sitio_web || "",
          celular: empresa.celular || "",
        });
      } else {
        setEmpresaExistente(null);
      }
    } catch (err) {
      console.error("Error verificando empresa existente:", err);
      setEmpresaExistente(null);
    }
  };

  // ✅ Validar campos obligatorios
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
      const valor = (formData[campo] ?? "").trim();
      if (!valor) errores.push(mensaje);
    });

    if (errores.length > 0) {
      setError(errores[0]);
      return false;
    }

    return true;
  };

  // ✅ Guardar o actualizar empresa
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!validarFormulario()) return false;

    setLoading(true);
    setError("");

    try {
      let empresaId = empresaExistente?.id;

      const empresaData = {
        nombre: formData.nombreEmpresa.trim(),
        descripcion: formData.descripcion.trim(),
        telefono: formData.telefono.trim() || null,
        correo_contacto: formData.correo_contacto.trim(),
        ciudad: formData.ciudad.trim(),
        direccion_principal: formData.direccionPrincipal.trim(),
        celular: formData.celular.trim() || null,
        sitio_web: formData.sitio_web.trim() || null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (empresaExistente) {
        const { error } = await supabase
          .from("empresas")
          .update(empresaData)
          .eq("id", empresaId);

        if (error) throw error;
      } else {
        const insertData = {
          ...empresaData,
          created_at: new Date().toISOString(),
          rating: "0.0",
        };

        const { data, error } = await supabase
          .from("empresas")
          .insert(insertData)
          .select("id")
          .single();

        if (error) throw error;
        empresaId = data.id;

        if (setUserTypeManually) setUserTypeManually("proveedor");
      }

      return true;
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al guardar la información. Intenta nuevamente.");
      return false;
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

  return {
    formData,
    setFormData,
    loading,
    error,
    empresaExistente,
    user,
    handleSubmit,
    handleInputChange,
  };
}
