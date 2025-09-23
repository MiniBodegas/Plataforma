import { useState } from "react";

export function Carrousel({ images = [], title = "Galería de imágenes" }) {
  // Convertir URLs simples a objetos con estructura esperada
  const formatImages = (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return [];

    return imageUrls.map((url, index) => {
      // Si ya es un objeto con image y title, mantenerlo
      if (typeof url === "object" && url.image) {
        return url;
      }

      // Si es solo una URL, convertirla a objeto
      return {
        image: url,
        title: `${title} - Imagen ${index + 1}`,
      };
    });
  };

  // Imágenes por defecto si no hay ninguna
  const defaultImages = [
    {
      image:
        "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop",
      title: `${title} - Vista principal`,
    },
  ];

  const formattedImages = formatImages(images);
  const carouselImages =
    formattedImages.length > 0 ? formattedImages : defaultImages;

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-20 bg-white px-4">
      {/* Título principal */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#2C3A61]">
          {title}
        </h2>
        <p className="text-gray-600 mt-2">
          {carouselImages.length}{" "}
          {carouselImages.length === 1 ? "imagen" : "imágenes"} disponibles
        </p>
      </div>

      {/* Carrusel */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
        <img
          src={carouselImages[current].image}
          alt={carouselImages[current].title}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            console.warn("Error cargando imagen:", carouselImages[current].image);
            e.target.src =
              "https://images.unsplash.com/photo-1609143739217-01b60dad1c67?q=80&w=687&auto=format&fit=crop";
          }}
        />

        {/* Overlay con información */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-lg font-medium">
            {carouselImages[current].title}
          </p>
        </div>

        {/* Botones de navegación - solo mostrar si hay más de una imagen */}
        {carouselImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Imagen anterior"
            >
              <svg
                className="w-5 h-5 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Imagen siguiente"
            >
              <svg
                className="w-5 h-5 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Contador de imágenes */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {current + 1} / {carouselImages.length}
        </div>
      </div>

      {/* Indicadores - solo mostrar si hay más de una imagen */}
      {carouselImages.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-3 w-3 rounded-full transition-all duration-200 ${
                current === index
                  ? "bg-[#4B799B] scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir a imagen ${index + 1}`
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
