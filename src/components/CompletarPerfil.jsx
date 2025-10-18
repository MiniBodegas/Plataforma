// Componente CompletarPerfil.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export function CompletarPerfil() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const BUCKET = "Avatars";

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!user?.id) {
      setError("No hay usuario autenticado.");
      return;
    }

    let fotoUrl = null;

    try {
      // 1) Subir la imagen (si el usuario eligió una)
      if (foto) {
        const extension = (foto.name?.split(".").pop() || "jpg").toLowerCase();
        // Puedes usar carpetas para evitar colisiones: `${user.id}/avatar.${extension}`
        const filePath = `Avatars/${user.id}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, foto, {
            upsert: true,
            contentType: foto.type || "image/*",
          });

        if (uploadError) throw uploadError;

        // 2) Obtener URL pública o firmada según el tipo de bucket
        // ---- PÚBLICO ----
        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        fotoUrl = publicData?.publicUrl || null;

        // ---- PRIVADO (opcional) ----
        // Si tu bucket es privado, comenta lo anterior y usa esto:
        // const { data: signedData, error: signedErr } = await supabase.storage
        //   .from(BUCKET)
        //   .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 días
        // if (signedErr) throw signedErr;
        // fotoUrl = signedData?.signedUrl || null;
      }

      // 3) Guardar nombre y (si existe) fotoUrl en la tabla
      //    Si la foto es opcional y no se cargó, no mandes foto_url para no sobreescribir con null
      const payload = { id: user.id, nombre };
      if (fotoUrl) payload.foto_url = fotoUrl;

      const { error: upsertError } = await supabase
        .from("usuarios")
        .upsert(payload, { onConflict: "id" }); // onConflict asegura que choque por id

      if (upsertError) throw upsertError;

      setStatus("Perfil guardado correctamente.");
      // Redirigir (opcional)
      setTimeout(() => (window.location.href = "/"), 1200);
    } catch (err) {
      setError("Ocurrió un error: " + (err?.message || "desconocido"));
    }
  };

  return (
    <div>
      {/* Popup de bienvenida */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">¡Bienvenido/a!</h2>
            <p className="mb-4">
              Antes de continuar, por favor completa tu perfil.<br />
              Solo te pediremos tu nombre.<br />
              ¡Muchas gracias por ser parte de MiniBodegas!
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-[#4B799B] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      {!showWelcome && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow flex flex-col items-center"
        >
          <h2 className="text-xl font-bold mb-6 text-center">Completa tu perfil</h2>

          {/* Mensajes */}
          {error && (
            <div className="mb-4 w-full bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-2 text-center">
              {error}
            </div>
          )}
          {status && (
            <div className="mb-4 w-full bg-green-100 border border-green-400 text-green-700 rounded-lg px-4 py-2 text-center">
              {status}
            </div>
          )}

          {/* Foto */}
          <div className="mb-6 flex flex-col items-center">
            <label htmlFor="foto" className="block mb-2 font-medium text-gray-700">
              Foto de perfil (opcional)
            </label>
            <div className="relative">
              <label htmlFor="foto" className="cursor-pointer">
                <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden shadow">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">+</span>
                  )}
                </div>
                <input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Nombre */}
          <div className="w-full mb-6">
            <label htmlFor="nombre" className="block mb-2 font-medium text-gray-700">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full h-12 rounded-2xl border border-gray-300 px-4 bg-white text-gray-900 
                focus:ring-2 focus:ring-[#4B799B] focus:border-[#4B799B] outline-none
                disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              placeholder="Escribe tu nombre"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-[#4B799B] hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}
