import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { ChecklistProgreso } from "./index";

const opciones = [
  {
    nombre: "Mi perfil",
    tipo: "ruta",
    ruta: "/completar-formulario-proveedor",
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
    ruta: "/completar-formulario-proveedor",
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
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

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

  // Solo carga la empresa, sin redirección por datos incompletos
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

        {/* Checklist de progreso */}
        <ChecklistProgreso />

        {/* Opciones del menú */}
        <div className="space-y-4 mb-4 flex-1">
          {opciones.map((opcion, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => handleClick(idx, opcion)}
                className="w-full p-4 bg-white hover:bg-gray-50 flex items-center justify-between text-left"
              >
                <span className="text-[#2C3A61] font-medium">{opcion.nombre}</span>
                {opcion.tipo === "desplegable" && (
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