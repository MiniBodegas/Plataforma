import { useState} from "react";
import { Image } from "lucide-react";

// Simple carrusel para imágenes
export function CarruselImagenes({ imagenes }) {
  const [idx, setIdx] = useState(0);
  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-xl w-full h-64">
        <Image className="w-16 h-16 text-gray-300" />
      </div>
    );
  }
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <img
        src={imagenes[idx]}
        alt={`Imagen ${idx + 1}`}
        className="object-contain rounded-xl w-full h-full bg-white"
      />
      {imagenes.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
            onClick={() => setIdx((idx - 1 + imagenes.length) % imagenes.length)}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
            onClick={() => setIdx((idx + 1) % imagenes.length)}
          >
            ›
          </button>
        </>
      )}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {imagenes.map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full ${i === idx ? "bg-[#2C3A61]" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}