import { useState } from "react";
import { useChatMiniBodegas } from "../hooks/useChatMiniBodegas";

export function ChatMiniBodegas() {
  const [mensaje, setMensaje] = useState("");
  const { preguntar, loading, respuesta, error } = useChatMiniBodegas();

  const enviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    await preguntar(mensaje);  // 👈 ya no pasamos productos, el hook los trae
    setMensaje("");
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Asistente MiniBodegas 🤖</h2>

      <div className="border rounded-lg h-64 p-3 overflow-auto bg-gray-50 mb-4">
        {respuesta ? (
          <>
            <p className="mb-3">
              <strong>Bot:</strong> {respuesta.mensaje}
            </p>

            {respuesta.productosRecomendados?.length > 0 && (
              <>
                <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                <ul className="list-disc ml-5">
                  {respuesta.productosRecomendados.map((p) => (
                    <li key={p.id}>
                      <strong>{p.id}</strong> – {p.razon}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p className="text-white-500">
            Escribe tu necesidad para recibir recomendaciones de bodegas.
          </p>
        )}

        {loading && <p className="text-blue-600 mt-2">Buscando bodegas…</p>}
        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </div>

      <form onSubmit={enviar} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 bg-white"
          placeholder="Ej: Necesito una bodega de 10m² en Cali para muebles"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          disabled={loading}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
