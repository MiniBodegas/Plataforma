import { Link } from 'react-router-dom';

export function Header({ tipo }) {
  return (
    <header
      className="w-full flex items-center justify-between px-8 py-4 bg-white text-[#2C3A61] shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <Link to={tipo === "proveedor" ? "/home-proveedor" : "/"} className="text-decoration-none">
          <h1 className="text-2xl font-bold text-[#2C3A61] hover:scale-105 transition-transform duration-300 cursor-pointer">
            MiniBodegas
          </h1>
        </Link>
      </div>

      {/* Menú */}
      <nav className="flex items-center space-x-6">
        {tipo === "usuario" && (
          <>
            <Link
              to="/"
              className="text-base font-medium relative group"
            >
              Calcula tu espacio
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link 
              to="/register"
              className="px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
              hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 inline-block"
            >
              Regístrate
            </Link>
          </>
        )}

        {tipo === "proveedor" && (
          <>
            <Link
              to="/home-proveedor"
              className="text-base font-medium relative group"
            >
              Crea tu mini bodega
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link 
              to="/register-proveedores"
              className="px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
              hover:bg-[#2C3A61] hover:text-white transition-colors duration-300 inline-block"
            >
              Regístrate como Proveedor
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
