export function CompanyDescription() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10 bg-gray-50 rounded-2xl shadow-lg mt-10 mb-10 p-8 ">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">RentaBox</h2>
        <p className="text-lg text-gray-600">Acopi - Yumbo</p>
      </div>

      {/* Descripción */}
      <div className="bg-blue-900 text-white rounded-2xl p-6 mb-8">
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
            src="https://images.unsplash.com/photo-1583337130417-3346a1b5fcbe?q=80&w=800"
            alt="Caja Rentabox"
            className="rounded-2xl shadow-md w-full object-cover"
          />
        </div>

        {/* Características */}
        <div className="bg-white rounded-2xl shadow p-6">
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
