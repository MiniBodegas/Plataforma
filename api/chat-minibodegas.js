import { recomendarProductosGemini } from "@minibodegas/chat-bot";

/**
 * Función serverless para Vercel
 * URL: /api/chat-minibodegas
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    // Opcional: decirle al cliente qué métodos se permiten
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { mensajeUsuario, productos } = req.body || {};

    if (!mensajeUsuario || !Array.isArray(productos)) {
      return res.status(400).json({
        error:
          "Faltan campos o formato inválido: 'mensajeUsuario' (string) y 'productos' (array) son requeridos",
      });
    }

    const respuesta = await recomendarProductosGemini({
      mensajeUsuario,
      productos,
    });

    return res.status(200).json(respuesta);
  } catch (error) {
    console.error("Error en /api/chat-minibodegas:", error);
    return res
      .status(500)
      .json({ error: "Error interno en el chatbot de MiniBodegas" });
  }
}
