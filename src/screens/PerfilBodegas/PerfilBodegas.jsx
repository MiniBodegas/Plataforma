import { Carrousel, PerfilCard, MapaBodegas, TestimonialsSection,CompanyDescriptionPerfil } from "../../components";
import { WAREHOUSES_DATA } from "../../data/warehouse";

export function PerfilBodegas() {
  return (
    <div>
      <Carrousel />
      <CompanyDescriptionPerfil />
      <PerfilCard />
      
      {/* Mapa simple */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#2C3A61" }}>
            Nuestras Ubicaciones
          </h2>
          <MapaBodegas 
            bodegas={WAREHOUSES_DATA}
            className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-lg"
            height="500px"
          />
        </div>
      </section>
      
      <TestimonialsSection />
    </div>
  );
}