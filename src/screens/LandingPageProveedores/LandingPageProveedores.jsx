import { useEffect } from "react";
import {CompanyDescriptionProveedores,FeaturesCardsProveedores,HeroSectionProveedor,FAQCardsProveedores,TestimonialsSection,CallToAction} from '../../components/index'

export function LandingPageProveedores() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <HeroSectionProveedor />
      <FeaturesCardsProveedores />
      <CompanyDescriptionProveedores /> 
      <CallToAction />
      <TestimonialsSection />
      <FAQCardsProveedores />
    </div>
  );
}