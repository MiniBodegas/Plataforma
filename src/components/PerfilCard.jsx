export function PerfilCard() {
  const sizeGuides = [
    {
      title: "Sede Palmira",
      description:
        "RentaBox cuenta con mas de 30 mini bodegas en esta sede. Tiene disponible desde 10 m3 hasta 80 m3. Presenta las mejores características de la ciudad",
      image: "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
    },
    {
      title: "Sede Yumbo",
      description:
        "RentaBox cuenta con mas de 30 mini bodegas en esta sede. Tiene disponible desde 10 m3 hasta 80 m3. Presenta las mejores características de la ciudad",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]

  const handleExplorar = (guide) => {
    console.log("Explorando:", guide.title);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{ color: "#2C3A61" }}>
          Guías de tamaños
        </h2>
        
        {/* Grid centrado para 2 cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
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
                <h3 className="font-semibold text-gray-900 mb-3 text-center text-xl" style={{ color: "#2C3A61" }}>
                  {guide.title}
                </h3>
                <p className="text-gray-600 text-sm flex-1 mb-4" style={{ color: "#2C3A61" }}>
                  {guide.description}
                </p>
                
                <button 
                  onClick={() => handleExplorar(guide)}
                  className="w-full text-white py-3 px-4 rounded-md font-medium transition-all duration-200 mt-auto"
                  style={{
                    backgroundColor: "#2C3A61"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#1e2a4a";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#2C3A61";
                  }}
                >
                  Explorar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}