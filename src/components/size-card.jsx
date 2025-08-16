export default function SizeGuideSection() {
  const sizeGuides = [
    {
      title: "Desde 1 m² hasta 15 m²",
      description:
        "Ideales para objetos de uso casual, grandes, de temporada o con finalidad de almacenamiento. Perfectos para guardar objetos de un apartamento.",
    },
    {
      title: "Desde 15 m² hasta 40 m²",
      description:
        "Ideales para el contenido de una habitación completa o una casa pequeña. Perfectos para mudanzas o almacenamiento de muebles de un apartamento de 2-3 habitaciones.",
    },
    {
      title: "Más de 42 m²",
      description:
        "Ideales para el contenido de una casa completa o una gran oficina. Perfectos para empresas que necesitan almacenar inventario.",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Guías de tamaños</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sizeGuides.map((guide, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-3">{guide.title}</h3>
              <p className="text-gray-600 text-sm">{guide.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
