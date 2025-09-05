import React, { useState } from "react";

export function PerfilForm() {
  const [nombre, setNombre] = useState("Juan Esteban Ramirez Perdomo");
  const [email, setEmail] = useState("juan.ramirez@email.com");
  const [telefono, setTelefono] = useState("3001234567");
  const [imagen, setImagen] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los datos
    alert("Datos actualizados correctamente");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mt-12 mb-2">
          Editar perfil
        </h2>
        <form
          className="max-w-xl mx-auto bg-gray-50 rounded-xl border border-gray-200 p-8 mt-8"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center mb-6">
            <label htmlFor="imagen" className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                {imagen ? (
                  <img src={imagen} alt="Perfil" className="w-full h-full object-cover" />
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
            <label className="block text-[#2C3A61] font-semibold mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C3A61] bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#2C3A61] font-semibold mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C3A61] bg-white"
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#2C3A61] font-semibold mb-2">Teléfono</label>
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