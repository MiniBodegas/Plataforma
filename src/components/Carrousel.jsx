import { useState } from "react";

const slides = [
  {
    id: 1,
    image: "https://picsum.photos/id/1015/900/500",
    title: "Rentabox",
  },
  {
    id: 2,
    image: "https://picsum.photos/id/1016/900/500",
    title: "StoreIt",
  },
  {
    id: 3,
    image: "https://picsum.photos/id/1018/900/500",
    title: "BoxSpace",
  },
  {
    id: 4,
    image: "https://picsum.photos/id/1020/900/500",
    title: "Move&Keep",
  },
];

export function Carrousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {     
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Imagen */}
      <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
        <img
          src={slides[current].image}
          alt={slides[current].title}
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
        {slides[current].title}
      </p>

      {/* Indicadores */}
      <div className="flex justify-center mt-2 space-x-2">
        {slides.map((_, index) => (
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
