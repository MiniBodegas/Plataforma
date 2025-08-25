import { Carrousel,MapaBodegas,CompanyDescription,SizeGuideSection, TestimonialsSection, } from '../../components/index';

export function BodegasDisponibles() {
  return (
    <div className="min-h-screen bg-white">
      <Carrousel />
      <CompanyDescription />
      <SizeGuideSection />
      <MapaBodegas 
            city="Cali" 
            bodegas={[
                { id: 1, name: "Bodega Norte", city: "Cali", coords: [3.45, -76.53] },
                { id: 2, name: "Bodega Centro", city: "Bogotá", coords: [4.71, -74.07] },
            ]}
            />
      <TestimonialsSection />
    </div>
  );
}

