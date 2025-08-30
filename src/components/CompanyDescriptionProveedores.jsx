import { motion } from "framer-motion"

export function CompanyDescriptionProveedores() {
  const items = [
    {
      title: "Requisitos de registro",
      description: [
        "Certificado de Cámara de comercio",
        "RUT actualizado",
        "Cédula del representante legal",
        "Visita de verificación (Según el caso).",
      ],
      image:
        "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg",
    },
    {
      title: "Procesos de reserva y confirmación",
      description: [
        "Tiempo máximo de confirmación: 24H",
        "Falta de confirmación puede afectar tu reputación y disponibilidad.",
      ],
      image:
        "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg",
    },
    {
      title: "Comisión y pagos",
      description: [
        "Comisión única sobre la primera renta",
        "Pago transferido dentro de 15 días tras la confirmación",
        "Pagos recurrentes mensuales sin comisión adicional.",
      ],
      image:
        "https://rentabox.com.co/wp-content/uploads/2025/07/image-01-1140x894.jpg",
    },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide">
          Detalles esenciales
        </h2>
      </div>

      {/* Cards */}
      <div className="space-y-6">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className={`flex flex-col md:flex-row gap-4 ${
              idx === 1 ? "md:flex-row-reverse" : ""
            }`}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -80 : 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            viewport={{ once: true }}
          >
            {/* Imagen */}
            <div className="w-full md:w-1/2 bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-48 md:h-60"
              />
            </div>

            {/* Texto con hover */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-1/2 bg-white rounded-xl shadow-md p-6 flex flex-col justify-center cursor-pointer"
            >
              <h3 className="font-semibold text-xl text-gray-800 mb-3">
                {item.title}
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {item.description.map((desc, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ color: "#2563eb" }} // azul al pasar el mouse
                    transition={{ duration: 0.2 }}
                  >
                    {desc}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
