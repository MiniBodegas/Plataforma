export function StatsSection() {
  const stats = [
    { number: "10k", label: "Mini bodegas\nActivas" },
    { number: "+1200", label: "Usuarios\nregistrados" },
    { number: "6", label: "Ciudades\nactivas" },
    { number: "+20", label: "Proveedores\naliados" },
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3" style={{ color: "#2C3A61" }}>
                {stat.number}
              </div>
              <div className="text-sm sm:text-base whitespace-pre-line leading-tight" style={{ color: "#2C3A61" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}