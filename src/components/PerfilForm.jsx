import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function PerfilForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Imagen: file nuevo seleccionado
  const [imagen, setImagen] = useState(null);
  // Preview: lo que se muestra en UI (puede ser URL pública o blob:)
  const [preview, setPreview] = useState(null);
  // URL actualmente guardada en la DB (persistente)
  const [fotoUrlActual, setFotoUrlActual] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del usuario al montar
  useEffect(() => {
    async function fetchPerfil() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Trae datos de la tabla usuarios
        const { data, error: selectError } = await supabase
          .from("usuarios")
          .select("nombre, foto_url, telefono")
          .eq("id", user.id)
          .single();

        // Email desde auth
        setEmail(user.email || "");

        if (selectError && selectError.code !== "PGRST116") {
          // PGRST116 = no rows
          setError(`Error al cargar datos: ${selectError.message}`);
          return;
        }

        if (data) {
          setNombre(data.nombre || "");
          setTelefono(data.telefono || "");
          if (data.foto_url) {
            setFotoUrlActual(data.foto_url); // URL real en DB
            setPreview(data.foto_url);       // mostrarlo en UI
            setImagen(null);                 // no hay nuevo archivo todavía
          }
        } else {
          // Si no existe fila, crearla
          await supabase.from("usuarios").upsert([
            { id: user.id, nombre: "", telefono: "", foto_url: null }
          ]);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }

    fetchPerfil();
  }, [user]);

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones opcionales
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`La imagen supera ${maxMB} MB`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen");
      return;
    }

    // Preview solo para UI
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setImagen(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let fotoUrl = fotoUrlActual || null;

      // ¿Se seleccionó una imagen nueva? (tipo File, no string)
      const hayNuevaImagen = imagen && typeof imagen !== "string";

      if (hayNuevaImagen) {
        const ext = (imagen.name?.split(".").pop() || "jpg").toLowerCase();
        const filePath = `Avatars/avatars-${user.id}.${ext}`; // carpeta Avatars/ dentro del bucket Avatars

        // Sube el archivo (upsert true para sobrescribir)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("Avatars") // nombre del bucket
          .upload(filePath, imagen, {
            cacheControl: "3600",
            upsert: true,
            contentType: imagen.type || `image/${ext}`,
          });

        if (uploadError) {
          console.error("Error al subir imagen:", uploadError);
          alert("Error al subir la imagen: " + uploadError.message);
          setLoading(false);
          return;
        }

        // Obtén URL pública (si el bucket Avatars es público)
        const { data: publicData } = supabase.storage
          .from("Avatars")
          .getPublicUrl(uploadData.path);

        fotoUrl = publicData?.publicUrl || null;

        // Si el bucket NO es público, usa en su lugar:
        // const { data: signed } = await supabase.storage
        //   .from("Avatars")
        //   .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365); // 1 año
        // fotoUrl = signed?.signedUrl || null;
      }

      // Actualiza los datos en la tabla usuarios
      const { error: upsertError } = await supabase.from("usuarios").upsert([
        {
          id: user.id,
          nombre,
          telefono,
          foto_url: fotoUrl,
        },
      ]);

      if (upsertError) {
        console.error("Error al guardar datos:", upsertError);
        alert("Error al guardar los datos: " + upsertError.message);
        setLoading(false);
        return;
      }

      // Actualiza estados locales
      setFotoUrlActual(fotoUrl);
      if (hayNuevaImagen) {
        setImagen(null);
        setPreview(fotoUrl || preview); // mostrar la URL pública en UI
      }

      alert("Datos actualizados correctamente");
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        {/* Flecha de regreso */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="text-[#2C3A61] hover:text-[#1e2a47] transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mt-4 mb-2">
          Editar perfil
        </h2>

        {loading ? (
          <div className="text-center py-12">Cargando datos...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <form
            className="max-w-xl mx-auto bg-gray-50 rounded-xl border border-gray-200 p-8 mt-8"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col items-center mb-6">
              <label htmlFor="imagen" className="cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Imagen</span>
                  )}
                </div>
                <input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagenChange}
                />
              </label>
              <span className="text-sm text-gray-500">Cambiar imagen</span>
            </div>

            <div className="mb-4">
              <label className="block text-[#2C3A61] font-semibold mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C3A61] bg-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[#2C3A61] font-semibold mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#2C3A61] font-semibold mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C3A61] bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2C3A61] text-white font-bold py-3 rounded-lg hover:bg-[#1e2947] transition"
            >
              Guardar cambios
            </button>
          </form>
        )}
      </div>

      <footer className="text-center py-6 text-[#2C3A61] text-sm">
        Plataforma de mini bodegas
        <div className="flex justify-center gap-4 mt-2">
          <a href="#" aria-label="Facebook">
            <svg width="20" height="20" fill="none" stroke="#2C3A61" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg width="20" height="20" fill="none" stroke="#2C3A61" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3.2"/>
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="17.5" cy="6.5" r="1"/>
            </svg>
          </a>
          <a href="#" aria-label="WhatsApp">
            <svg width="20" height="20" fill="none" stroke="#2C3A61" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 4.5A9.5 9.5 0 0 0 4.5 20l-1.5 4 4-1.5A9.5 9.5 0 1 0 20 4.5z"/>
              <path d="M8.5 13.5c1.5 3 6 3 7.5 0"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
