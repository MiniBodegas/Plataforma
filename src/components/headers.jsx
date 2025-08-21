export function Header() {
  return (
    <header
      className="w-full flex items-center justify-between px-8 py-4 bg-white text-[#2C3A61] shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <a href="/" className="text-decoration-none">
          <h1 className="text-2xl font-bold text-[#2C3A61] hover:scale-105 transition-transform duration-300 cursor-pointer">
            MiniBodegas
          </h1>
        </a>
      </div>

      <nav className="flex items-center space-x-6">
        <a
          href="/"
          className="text-base font-medium relative group"
        >
          Calcula tu espacio
          {/* Línea animada abajo del texto */}
          <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2C3A61] transition-all duration-300 group-hover:w-full"></span>
        </a>

        <button
          className="px-4 py-2 rounded font-semibold border border-[#2C3A61] bg-white text-[#2C3A61] 
          hover:bg-[#2C3A61] hover:text-white transition-colors duration-300"
        >
          Regístrate
        </button>
      </nav>
    </header>
  );
}