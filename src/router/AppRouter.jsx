
import { Routes, Route } from 'react-router-dom';
import {Header,HeroSection,CitiesSection,StatsSection,FeaturesCards,SizeGuideSection,TestimonialsSection,FAQCards,Footer} from '../components/index'

export const AppRouter = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/cities" element={<CitiesSection />} />
          <Route path="/stats" element={<StatsSection />} />
          <Route path="/features" element={<FeaturesCards />} />
          <Route path="/sizes" element={<SizeGuideSection />} />
          <Route path="/testimonials" element={<TestimonialsSection />} />
          <Route path="/faq" element={<FAQCards />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

