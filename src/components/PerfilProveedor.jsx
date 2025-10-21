import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { ChecklistProgreso } from "./index";

const opciones = [
  {
    nombre: "Mis bodegas",
    tipo: "ruta",
    ruta: "/mis-mini-bodegas",
  },
  {
    nombre: "Reservas y transacciones",
    tipo: "ruta",
    ruta: "/mis-bodegas",
  },
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
  const { user, loading: authLoading } = useAuth(); // Obtener authLoading

  useEffect(() => {
    console.log('🚀 PerfilProveedor useEffect ejecutado');
    console.log('👤 Usuario actual:', user);
    console.log('⏳ Auth loading:', authLoading);
    
    // NO hacer nada si auth está cargando
    if (authLoading) {
      console.log('⏳ Auth aún cargando, esperando...');
      return;
    }
    
    // Si auth terminó de cargar pero no hay usuario, redirigir a login
    if (!authLoading && !user) {
      console.log('❌ No hay usuario después de cargar auth, redirigiendo a login...');
      navigate('/login-proveedor'); // o la ruta que uses para login de proveedores
      return;
    }
    
    // Si hay usuario, verificar información
    if (user) {
      verificarInformacionCompleta();
    }
  }, [user, authLoading]); // Agregar authLoading como dependencia

  const verificarInformacionCompleta = async () => {
    console.log('🔍 Iniciando verificación de información completa...');
    
    if (!user) {
      console.log('❌ No hay usuario en verificarInformacionCompleta');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📡 Consultando empresa para user_id:', user.id);
      
      const { data: empresaData, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      console.log('📊 Resultado consulta empresa:');
      console.log('  - Data:', empresaData);
      console.log('  - Error:', error);
        
      if (error || !empresaData) {
        console.log('❌ No se encontró empresa o hubo error, redirigiendo al formulario...');
        navigate('/completar-formulario-proveedor');
        return;
      }

      // Verificar si las columnas existen
      console.log('🔍 Verificando columnas existentes:', Object.keys(empresaData));

      // VALIDACIÓN COMPLETA - todos los campos obligatorios
      const camposObligatorios = [
        'nombre',
        'ciudad',
      ];

      console.log('📝 Verificando campos obligatorios:', camposObligatorios);

      const informacionIncompleta = camposObligatorios.some(campo => {
        const valor = empresaData[campo];
        const estaVacio = !valor || (typeof valor === 'string' && valor.trim() === '');
        console.log(`  - ${campo}: "${valor}" (vacío: ${estaVacio})`);
        return estaVacio;
      });

      console.log('📋 Información incompleta:', informacionIncompleta);

      if (informacionIncompleta) {
        console.log('❌ Información incompleta, redirigiendo al formulario...');
        navigate('/completar-formulario-proveedor');
        return;
      }

      console.log('✅ Información completa, mostrando perfil');
      setEmpresa(empresaData);
    } catch (error) {
      console.error('💥 Error verificando empresa:', error);
      navigate('/completar-formulario-proveedor');
    } finally {
      setLoading(false);
      console.log('⏳ Loading establecido a false');
    }
  };

  const handleClick = (idx, opcion) => {
    if (opcion.tipo === "ruta") {
      navigate(opcion.ruta);
    } else {
      setOpen(open === idx ? null : idx);
    }
  };

  console.log('🎨 Renderizando PerfilProveedor - AuthLoading:', authLoading, 'Loading:', loading, 'Empresa:', empresa);

  // Mostrar loading mientras auth está cargando O mientras verificamos empresa
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

  // Si llegamos aquí, significa que auth cargó, hay usuario y empresa válida
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <div className="px-6 py-6">
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
        <div className="space-y-4">
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
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="p-6">
        <button 
          onClick={() => navigate('/login-proveedor')}
          className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}