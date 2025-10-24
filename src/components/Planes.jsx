import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function Planes() {
  const sizeGuides = [
    {
      key: "gratuito",
      title: "Gratuito",
      description: "Pensado para que cualquier operador de mini bodegas pueda empezar sin barreras ni costos fijos. Incluye:",
      features: [
        "Publicación ilimitada de bodegas",
        "Visibilidad en la plataforma para todos los usuarios",
        "Gestión comercial automatizada: la plataforma se encarga de atraer clientes",
        "Reservas confirmadas con pago inicial",
        "Sin necesidad de desarrollar tecnología propia"
      ],
      comision: "Comisión por resultado: Solo se cobra una comisión equivalente al primer mes de arriendo cuando el cliente concreta y paga la reserva a través de la plataforma.",
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    // Puedes agregar más planes aquí
  ];

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Busca el empresaId del usuario actual
  const [empresaId, setEmpresaId] = useState(null);

  // Obtén el empresaId al cargar el componente
  useState(() => {
    const fetchEmpresa = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("empresas")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data?.id) setEmpresaId(data.id);
    };
    fetchEmpresa();
  }, [user]);

  const handleObtener = async (planKey) => {
    setLoading(true);
    setError("");
    try {
      if (!empresaId) {
        setError("No se encontró la empresa.");
        setLoading(false);
        return;
      }
      // Actualiza el plan en la empresa
      const { error: updateError } = await supabase
        .from("empresas")
        .update({ plan: planKey })
        .eq("id", empresaId);

      if (updateError) {
        setError("No se pudo guardar el plan. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      // Avanza solo si se guardó correctamente
      navigate("/bodega-editor-proveedor");
    } catch (err) {
      setError("Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16e">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-8 max-w-md">
            {sizeGuides.map((guide, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-48 w-full object-cover rounded-lg mb-6"
                />
                <h3 className="font-bold text-2xl mb-4 text-center" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                  {guide.description}
                </p>
                <div className="mb-6">
                  <ul className="space-y-3">
                    {guide.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3" style={{ backgroundColor: "#2C3A61" }}></div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: "#2C3A61" }}>
                  <p className="text-sm font-medium" style={{ color: "#2C3A61" }}>
                    {guide.comision}
                  </p>
                </div>
                <button
                  className="w-full mt-6 py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 hover:transform hover:scale-105"
                  style={{ backgroundColor: "#2C3A61" }}
                  disabled={loading}
                  onClick={() => handleObtener(guide.key)}
                >
                  {loading ? "Guardando..." : "Obtener"}
                </button>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}