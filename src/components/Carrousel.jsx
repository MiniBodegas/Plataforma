import { useState } from "react";

// Ejemplo de cómo actualizar Carrousel para recibir props
export function Carrousel({ images = [], title = "" }) {
  // Usar images en lugar de datos estáticos
  // Si no hay imágenes, usar una por defecto
  const defaultImages = [
    "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop",
  ];

  const carouselImages = images.length > 0 ? images : defaultImages;

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-20 bg-white">
      {/* Imagen */}
      <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
        <img
          src={carouselImages[current].image}
          alt={carouselImages[current].title}
          className="w-full h-full object-cover"
        />

        {/* Botón izquierda */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow"
        >
          ◀
        </button>

        {/* Botón derecha */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/60 p-2 rounded-full shadow"
        >
          ▶
        </button>
      </div>

      {/* Texto */}
      <p className="text-center mt-4 text-lg font-semibold">
        {carouselImages[current].title}
      </p>

      {/* Indicadores */}
      <div className="flex justify-center mt-2 space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full ${
              current === index ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
