
import { Routes, Route } from 'react-router-dom';
import {Header,Footer} from '../components/index'
import {HomeScreen,BodegaScreen,BodegasDisponibles,Reservation,PerfilBodegas,Register,Login,LandingPageProveedores} from '../screens/index'

export const AppRouter = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/bodegas" element={<BodegaScreen />} />
          <Route path="/bodegas/:id" element={<BodegasDisponibles />} />
          <Route path="/reservas" element={<Reservation />} />
          <Route path="/perfil-bodegas" element={<PerfilBodegas />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />


          <Route path="/home-proveedor" element={<LandingPageProveedores />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

