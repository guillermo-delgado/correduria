import { useState } from "react";

export default function ChatGPT() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `🧑‍💼 Tú: ${input}`]);
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer REMOVED_API_KEY`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Eres un asistente virtual especializado en seguros." },
            { role: "user", content: input }
          ]
        })
      });

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;

      if (reply) {
        setMessages((prev) => [...prev, `🤖 ChatGPT: ${reply}`]);
      } else {
        setMessages((prev) => [...prev, "❌ Error: No se pudo obtener una respuesta."]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, "❌ Error de red o API."]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg max-w-xl mx-auto mt-10 mb-20">
      <h2 className="text-xl font-bold mb-4 text-center">Asistente Virtual</h2>
      <div className="h-64 overflow-y-auto border p-4 mb-4 rounded bg-gray-50">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm mb-2 whitespace-pre-wrap">{msg}</p>
        ))}
        {loading && <p className="text-gray-500">⏳ ChatGPT está escribiendo...</p>}
      </div>
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
