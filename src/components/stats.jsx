export function StatsSection() {
  const stats = [
    { number: "10k", label: "Mini bodegas\nActivas" },
    { number: "+1200", label: "Usuarios\nregistrados" },
    { number: "6", label: "Ciudades\nactivas" },
    { number: "+20", label: "Proveedores\naliados" },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm whitespace-pre-line">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
