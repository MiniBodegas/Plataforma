import { Routes, Route, Outlet } from 'react-router-dom';
import { Header, Footer } from '../components/index';
import {
  HomeScreen,
  BodegaScreen,
  BodegasDisponibles,
  Reservation,
  PerfilBodegas,
  Register,
  Login,
  LandingPageProveedores,
  RegisterProveedoresScreen,
  LoginProveedoresScreen,
  PlanesScreen,
  Reservas,
  MisBodegasScreen,
  BalanceScreen,
  CalculadoraScreen,
  BodegasUsuario
} from '../screens/index';

// ====================== 
// Layout para Usuarios
// ======================
function UserLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header tipo="usuario" />
      <main className="p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ======================
// Layout para Proveedores
// ======================
function ProveedorLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header tipo="proveedor" />
      <main className="p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ======================
// Router principal
// ======================
export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas de usuarios */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/bodegas" element={<BodegaScreen />} />
        <Route path="/bodegas/:id" element={<BodegasDisponibles />} />
        <Route path="/reservas" element={<Reservation />} />
        <Route path="/perfil-bodegas" element={<PerfilBodegas />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calculadora" element={<CalculadoraScreen />} />
        <Route path="/bodegas-usuario" element={<BodegasUsuario />} />
        
      </Route>
      {/* Rutas de proveedores */}
      <Route element={<ProveedorLayout />}>
        <Route path="/home-proveedor" element={<LandingPageProveedores />} />
        <Route path="/register-proveedores" element={<RegisterProveedoresScreen />} />
        <Route path="/login-proveedores" element={<LoginProveedoresScreen />} />
        <Route path="/planes" element={<PlanesScreen />} />
        <Route path="/mis-bodegas" element={<Reservas />} />
        <Route path="/mis-mini-bodegas" element={<MisBodegasScreen />} />
        <Route path="/balance" element={<BalanceScreen />} />


        {/* aquí puede agregar más rutas exclusivas de proveedores */}
      </Route>
    </Routes>
  );
};
