import { motion } from "framer-motion";

export function CallToAction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-md p-6 max-w-5xl mx-auto"
    >
      {/* Imagen */}
      <img
        src="/cta-image.png" // 👉 cámbielo por su ruta real
        alt="CTA Imagen"
        className="w-52 h-auto rounded-lg object-cover"
      />

      {/* Texto y botón */}
      <div className="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          ¿Listo para aumentar los ingresos de tus mini bodegas?
        </h2>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
          Comienza tu registro hoy mismo
        </button>
        <p className="mt-2 text-gray-600 text-sm md:text-base">
          No toma más de 5 min
        </p>
      </div>
    </motion.div>
  );
}
