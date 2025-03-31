export async function sendMessageToChatGPT(message: string): Promise<string> {
  try {
    // ✅ Session ID persistente
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = Date.now().toString();
      localStorage.setItem("sessionId", sessionId);
      console.log("🆕 Nuevo sessionId creado:", sessionId);
    } else {
      console.log("✅ Usando sessionId existente:", sessionId);
    }

    // ✅ Usuario autenticado
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) {
      throw new Error("No hay usuario autenticado");
    }

    // ✅ URL dinámica para entorno local o producción
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    console.log("📤 Enviando mensaje al backend:", message);
    console.log("🌐 URL:", `${BASE_URL}/api/chat`);

    // ✅ Enviar mensaje
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId, userId: user._id }),
    });

    const text = await response.text();
    console.log("📥 Texto crudo recibido:", text);

    const data = JSON.parse(text);
    console.log("✅ JSON parseado:", data);

    return data.reply || "No se recibió respuesta";
  } catch (error) {
    console.error("❌ Error al conectar con el backend:", error);
    return "Ocurrió un error al obtener respuesta";
  }
}
