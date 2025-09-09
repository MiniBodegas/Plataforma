import { useState } from "react";
import { BodegaCarruselEditor, DescriptionEditor, CardBodegas, AgregarMiniBodegaBtn } from "../../components/index";
import { Trash2 } from "lucide-react";

export function BodegaEditorProveedorScreen() {
  const [bodegas, setBodegas] = useState([
    { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" },
    { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" }
  ]);

  // Agregar nueva mini bodega
  const handleAgregarBodega = () => {
    setBodegas([
      ...bodegas,
      { metraje: "", descripcion: "", contenido: "", imagen: null, direccion: "" }
    ]);
  };

  // Eliminar una card
  const handleEliminarBodega = (idx) => {
    setBodegas(bodegas.filter((_, i) => i !== idx));
  };

  // Actualizar una bodega
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
      <h2 className="mt-10 text-3xl font-bold text-center mb-8 text-[#2C3A61]">Tamaños disponibles</h2>
      <div className="flex gap-8 justify-center items-start">
        {bodegas.map((bodega, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <CardBodegas
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
            <button
              className="mt-4 bg-red-100 hover:bg-red-200 rounded-full p-2"
              onClick={() => handleEliminarBodega(idx)}
              title="Eliminar mini bodega"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
          </div>
        ))}
        <div className="flex flex-col items-center">
          <AgregarMiniBodegaBtn onClick={handleAgregarBodega} />
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <button
          className="bg-[#2C3A61] text-white font-bold px-8 py-3 rounded-xl shadow hover:bg-[#4B799B] transition"
          onClick={() => {
            // Aquí puedes poner la lógica para guardar los cambios
            // Por ejemplo, enviar los datos a tu API
            console.log("Guardar cambios", bodegas);
          }}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
