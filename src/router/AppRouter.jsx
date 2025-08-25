
import { Routes, Route } from 'react-router-dom';
import {Header,Footer} from '../components/index'
import {HomeScreen,BodegaScreen,BodegasDisponibles} from '../screens/index'

export const AppRouter = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/bodegas" element={<BodegaScreen />} />
          <Route path="/bodegas/:id" element={<BodegasDisponibles />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

