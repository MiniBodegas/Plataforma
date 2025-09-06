export function StatsSection() {
  const stats = [
    { number: "10k", label: "Mini bodegas\nActivas" },
    { number: "+1200", label: "Usuarios\nregistrados" },
    { number: "6", label: "Ciudades\nactivas" },
    { number: "+20", label: "Proveedores\naliados" },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scale-[1.15]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold mb-3" style={{ color: "#2C3A61" }}>
                {stat.number}
              </div>
              <div className="text-base whitespace-pre-line" style={{ color: "#2C3A61" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}