import { HeroSection, CitiesSection, StatsSection, FeaturesCards, SizeGuideSection, TestimonialsSection, FAQCards } from '../../components/index';

export function HomeScreen() {
  return (
    <div className="min-h-screen bg-gray-50">
        <HeroSection />
        <CitiesSection />
        <StatsSection />
        <FeaturesCards />
        <SizeGuideSection />
        <TestimonialsSection />
        <FAQCards />
    </div>
  );
}

