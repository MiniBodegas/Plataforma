import { Link } from 'react-router-dom';

export function CompanyDescriptionProveedores() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8 ">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <Link 
          to="/perfil-bodegas" 
          className="text-3xl font-bold text-gray-800 hover:text-[#2C3A61] transition-colors duration-200 cursor-pointer inline-block underline decoration-2 underline-offset-4 hover:decoration-[#2C3A61]"
        >
          RentaBox
        </Link>
        <p className="text-lg text-gray-600">Acopi - Yumbo</p>
      </div>

      {/* Descripción */}
      <div className="bg-[#4B799B] text-white rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-2">Descripción</h3>
        <p className="leading-relaxed">
          En RentaBox ofrecemos espacios seguros, limpios y fácilmente accesibles,
          ideales para almacenar objetos personales, muebles, inventario empresarial
          o cualquier artículo que necesite resguardo temporal o prolongado. Nuestra
          ubicación es estratégica y cuenta con acceso controlado para brindarte 
          tranquilidad en todo momento.
        </p>
      </div>

      {/* Imagen + Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Imagen */}
        <div>
          <img
            src="https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg"
            alt="Caja Rentabox"
            className="rounded-2xl shadow-md w-full object-cover"
          />
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow p-6 h-full">
          <h3 className="font-semibold text-lg mb-4">Características</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Vigilancia 24/7 con cámaras de seguridad.</li>
            <li>Control de clima para proteger artículos sensibles.</li>
            <li>Acceso mediante código personalizado.</li>
            <li>Seguro incluido contra imprevistos.</li>
            <li>Estanterías disponibles.</li>
            <li>Iluminación LED eficiente y segura.</li>
            <li>Fácil acceso en vehículo o a pie.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}