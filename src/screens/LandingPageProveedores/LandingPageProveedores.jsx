import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {CompanyDescriptionProveedores,FeaturesCardsProveedores,HeroSectionProveedor,FAQCardsProveedores,TestimonialsSection,CallToAction} from '../../components/index'

export function LandingPageProveedores() {
  const { user, loading } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Esperar a que se resuelva el estado de auth antes de mostrar la página
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, []);

  useEffect(() => {
    console.log('👤 Estado auth en LandingPageProveedores:', { user, loading })
  }, [user, loading])

  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#4B799B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    )
  }

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