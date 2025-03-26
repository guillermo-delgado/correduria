export async function sendMessageToChatGPT(message: string): Promise<string> {
  try {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = Date.now().toString();
      localStorage.setItem("sessionId", sessionId);
      console.log("🆕 Nuevo sessionId creado:", sessionId);
    } else {
      console.log("✅ Usando sessionId existente:", sessionId);
    }

    console.log("📤 Enviando mensaje al backend:", message);

    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });

    const text = await response.text(); // <-- Usa .text() primero
    console.log("📥 Texto crudo recibido:", text);

    const data = JSON.parse(text); // <-- Luego lo parseas tú
    console.log("✅ JSON parseado:", data);

    return data.reply || "No se recibió respuesta";
  } catch (error) {
    console.error("❌ Error al conectar con el backend:", error);
    return "Ocurrió un error al obtener respuesta";
  }
}
