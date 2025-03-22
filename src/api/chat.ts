export async function sendMessageToChatGPT(message: string): Promise<string> {
  try {
    const response = await fetch("https://back-end-correduria.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data.reply || "No se recibió respuesta";
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return "Ocurrió un error al obtener respuesta";
  }
}
