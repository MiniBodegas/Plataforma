export default function CitiesSection() {
  const cities = [
    {
      name: "Bogotá",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Medellín",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Cali",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      name: "Cartagena",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Presencia en diferentes ciudades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div
              key={city.name}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img src={city.image || "/placeholder.svg"} alt={city.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-center">{city.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
