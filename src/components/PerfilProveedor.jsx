import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const opciones = [
  {
    nombre: "Mis bodegas",
    tipo: "ruta",
    ruta: "/mis-mini-bodegas",
  },
  {
    nombre: "Planes y facturación",
    tipo: "ruta",
    ruta: "/",
  },
  {
    nombre: "Mi perfil",
    tipo: "ruta",
    ruta: "/perfil-form-proveedor",
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
  {
    nombre: "Configuración de pagos",
    tipo: "desplegable",
    contenido: (
      <div className="p-4 text-gray-600">
        Métodos de pago registrados: <br />- Tarjeta Visa terminación 1234
      </div>
    ),
  },
];

export function PerfilProveedor() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const handleClick = (idx, opcion) => {
    if (opcion.tipo === "ruta") {
      navigate(opcion.ruta);
    } else {
      setOpen(open === idx ? null : idx);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <h2 className="text-2xl font-bold text-[#2C3A61] text-center mt-12 mb-2">
          Juan Esteban Ramirez Perdomo
        </h2>
        <h3 className="text-xl font-bold text-[#2C3A61] text-center mb-8">
          Mi cuenta
        </h3>
        <div className="max-w-xl mx-auto">
          {opciones.map((opcion, idx) => (
            <div key={opcion.nombre}>
              <button
                className="w-full flex items-center justify-between py-6 border-b border-gray-200 focus:outline-none"
                onClick={() => handleClick(idx, opcion)}
              >
                <span className="font-semibold text-[#2C3A61] text-left">{opcion.nombre}</span>
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  stroke="#2C3A61"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className={opcion.tipo === "desplegable" && open === idx ? "rotate-90 transition-transform" : ""}
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              {opcion.tipo === "desplegable" && open === idx && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 mb-4">
                  {opcion.contenido}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center py-6 text-[#2C3A61] text-sm">
        Plataforma de mini bodegas
        <div className="flex justify-center gap-4 mt-2">
          {/* Iconos de redes sociales (simples) */}
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