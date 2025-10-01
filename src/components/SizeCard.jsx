export function SizeGuideSection() {
  const sizeGuides = [
    {
      title: "Desde 1 m³ hasta 15 m³",
      description:
      [
        "Trasteo de apartaestudio",
         "Cajas y maletas", 
         "Equipo deportivo, Archivo"
      ]
        ,
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    },
    {
      title: "Desde 15 m³ hasta 40 m³",
      description:
        [
          "Mudanza 2-3 habitaciones", 
          "electrodomésticos", 
          "Stock de e-commerce", 
          "archivo empresarial",

        ],
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Más de 42 m³",
      description:
      ["Importaciones",
       "inventario",
       "mobiliario oficina",
       "Estantería/Estibas",
       "Materiales y equipos"
      ],
      image: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
          Guías de tamaños
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {sizeGuides.map((guide, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex flex-col max-w-xs mx-auto"
            >
              <img
                src={guide.image}
                alt={guide.title}
                className="h-48 w-full object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-3" style={{ color: "#2C3A61" }}>{guide.title}</h3>
              <p className="text-gray-600 text-sm flex-1" style={{ color: "#2C3A61" }}>{guide.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
