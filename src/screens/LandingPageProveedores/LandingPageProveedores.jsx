import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  CompanyDescriptionProveedores,
  FeaturesCardsProveedores,
  HeroSectionProveedor,
  FAQCardsProveedores,
  TestimonialsSection,
  CallToAction
} from '../../components/index'

export function LandingPageProveedores() {
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Solo mostrar loading por un momento para suavizar la transición
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300); // Reducido de 500ms a 300ms

    return () => clearTimeout(timer);
  }, []);

  // Debug simplificado - solo en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 Auth status:', { 
        userId: user?.id, 
        userType: user?.user_metadata?.user_type,
        loading,
        pageLoading 
      });
    }
  }, [user, loading, pageLoading]);

  // Mostrar loading mientras se resuelve la autenticación O el pageLoading
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-[#2C3A61] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#2C3A61] font-medium">
            {loading ? 'Verificando autenticación...' : 'Cargando página...'}
          </p>
        </div>
      </div>
    );
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