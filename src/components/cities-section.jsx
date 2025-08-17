export function CitiesSection() {
  const cities = [
    {
      name: "Bogotá",
      image: "https://cloudfront-us-east-1.images.arcpublishing.com/infobae/JAAYCWLOQRHOTKSLAZAH37REYM.jpeg",
    },
    {
      name: "Medellín",
      image: "https://forbes.co/_next/image?url=https%3A%2F%2Fcdn.forbes.co%2F2020%2F09%2FMedell%C3%ADn-foto-ProColombia.jpg&w=3840&q=75",
    },
    {
      name: "Cali",
      image: "https://www.uff.travel/region/25/cristo-rey-fuente-flickr1-800x0.jpg",
    },
    {
      name: "Cartagena",
      image: "https://i0.wp.com/travelandleisure-es.com/wp-content/uploads/2024/01/Cartagena_Colombia.jpg?fit=2258%2C1717&ssl=1",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#2C3A61" }}>
          Presencia en diferentes ciudades
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div
              key={city.name}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              style={{ color: "#2C3A61" }}
            >
              <img src={city.image || "/placeholder.svg"} alt={city.name} className="w-full h-80 object-cover" />
              <div className="p-4 flex-1 flex items-center justify-center">
                <h3 className="font-semibold text-center" style={{ color: "#2C3A61" }}>
                  {city.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
export default CitiesSection;