import { useState } from "react";
import { BodegaCarruselEditor, DescriptionEditor, CardBodegas, AgregarMiniBodegaBtn } from "../../components/index";

export function BodegaEditorProveedorScreen() {
  const [bodegas, setBodegas] = useState([
    { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" },
    { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" }
  ]);

  // Función para agregar una nueva mini bodega
  const handleAgregarBodega = () => {
    setBodegas([
      ...bodegas,
      { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" }
    ]);
  };

  // Función para actualizar una bodega
  const handleUpdateBodega = (idx, field, value) => {
    const nuevas = bodegas.map((b, i) =>
      i === idx ? { ...b, [field]: value } : b
    );
    setBodegas(nuevas);
  };

  return (
    <div>
      <BodegaCarruselEditor />
      <DescriptionEditor />
      <h2 className="text-3xl font-bold text-center mb-8 text-[#2C3A61]">Tamaños disponibles</h2>
      <div className="flex gap-8 justify-center items-start">
        {bodegas.map((bodega, idx) => (
          <CardBodegas
            key={idx}
            metraje={bodega.metraje}
            descripcion={bodega.descripcion}
            contenido={bodega.contenido}
            imagen={bodega.imagen}
            direccion={bodega.direccion}
            onImagenChange={img => handleUpdateBodega(idx, "imagen", img)}
            onMetrajeChange={val => handleUpdateBodega(idx, "metraje", val)}
            onDescripcionChange={val => handleUpdateBodega(idx, "descripcion", val)}
            onContenidoChange={val => handleUpdateBodega(idx, "contenido", val)}
            onDireccionChange={val => handleUpdateBodega(idx, "direccion", val)}
          />
        ))}
        <AgregarMiniBodegaBtn onClick={handleAgregarBodega} />
      </div>
    </div>
  );
}
