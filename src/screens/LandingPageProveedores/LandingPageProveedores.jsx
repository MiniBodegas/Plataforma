import {CompanyDescriptionProveedores,FeaturesCardsProveedores,HeroSectionProveedor,FAQCardsProveedores,TestimonialsSection,CallToAction} from '../../components/index'

export function LandingPageProveedores() {
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
