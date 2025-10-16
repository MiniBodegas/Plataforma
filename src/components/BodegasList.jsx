import React from "react";
// importa desde el index del directorio components para mantener la misma API que usas en pantallas
import { CardBodegas, AgregarMiniBodegaBtn } from "./index";

export function BodegasList({ bodegas = [], onChangeField, onEliminar, onAgregar }) {
  if (!Array.isArray(bodegas)) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
      {bodegas.map((b, idx) => {
        const imagen = b.imagen_url ?? b.imagen ?? null;
        const precioMensual = b.precio_mensual ?? b.precioMensual ?? "";
        const nombrePersonalizado = b.nombre_personalizado ?? b.nombrePersonalizado ?? "";

        return (
          <div key={b.id ?? idx} className="flex flex-col items-center w-full max-w-sm">
            <CardBodegas
              metraje={b.metraje}
              descripcion={b.descripcion}
              contenido={b.contenido}
              imagen={imagen}
              direccion={b.direccion}
              ciudad={b.ciudad}
              zona={b.zona}
              precioMensual={precioMensual}
              cantidad={b.cantidad}
              maxCantidad={b.maxCantidad ?? 99}
              nombrePersonalizado={nombrePersonalizado}
              hideGuardarButton={true}
              onImagenChange={(img) => onChangeField?.(idx, "imagen", img)}
              onMetrajeChange={(val) => onChangeField?.(idx, "metraje", val)}
              onDescripcionChange={(val) => onChangeField?.(idx, "descripcion", val)}
              onContenidoChange={(val) => onChangeField?.(idx, "contenido", val)}
              onDireccionChange={(val) => onChangeField?.(idx, "direccion", val)}
              onCiudadChange={(val) => onChangeField?.(idx, "ciudad", val)}
              onZonaChange={(val) => onChangeField?.(idx, "zona", val)}
              onPrecioMensualChange={(val) => onChangeField?.(idx, "precio_mensual", val)}
              onCantidadChange={(val) => onChangeField?.(idx, "cantidad", val)}
              onNombrePersonalizadoChange={(val) => onChangeField?.(idx, "nombre_personalizado", val)}
            />

            <button
              onClick={() => onEliminar?.(idx)}
              className="mt-4 rounded-full p-2 transition-all duration-200 bg-red-100 hover:bg-red-200 hover:scale-105"
              title="Eliminar mini bodega"
              type="button"
            >
              Eliminar
            </button>
          </div>
        );
      })}

      <div className="flex flex-col items-center w-full max-w-sm">
        <AgregarMiniBodegaBtn onClick={onAgregar} />
      </div>
    </div>
  );
}