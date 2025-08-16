import { Search, BarChart3, FileText, CreditCard } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Busca",
      description: "Encuentra bodegas y espacios disponibles en tu ciudad",
    },
    {
      icon: BarChart3,
      title: "Compara",
      description: "Compara precios, ubicaciones y servicios disponibles en tiempo real",
    },
    {
      icon: FileText,
      title: "Contrata",
      description: "Agenda tu visita y contrata el servicio que más te convenga",
    },
    {
      icon: CreditCard,
      title: "Reserva y paga",
      description: "Reserva tu bodega y paga de forma segura en línea",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              La forma mas simple
              <br />
              de liberar espacio
            </h2>
            <p className="text-gray-600">Reserva tu mini bodega en 4 pasos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
