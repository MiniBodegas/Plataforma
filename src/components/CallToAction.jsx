import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CallToAction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl shadow-md p-8 max-w-6xl mx-auto gap-6"
    >
      {/* Imagen */}
      <img
        src="https://images.unsplash.com/photo-1517430970194-f92273690924?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8T2ZmaWNlJTIwYm9hcmR8ZW58MHwwfDB8fHwy"
        alt="CTA Imagen"
        className="w-80 h-auto rounded-lg object-cover"
      />

      {/* Texto y botón */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          ¿Listo para aumentar los ingresos de tus mini bodegas?
        </h2>
        <Link to="/planes">
        <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 text-lg rounded-xl shadow-lg transition">
          Comienza tu registro hoy mismo
        </button>
        </Link>
        <p className="mt-3 text-gray-600 text-base md:text-lg">
          No toma más de 5 min
        </p>
      </div>
    </motion.div>
  );
}
