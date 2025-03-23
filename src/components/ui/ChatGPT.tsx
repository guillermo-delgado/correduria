import { useState, useEffect } from "react";

export default function ChatGPT() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `🧑‍💼 Tú: ${input}`]);
    setLoading(true);

    try {
      const res = await fetch("https://back-end-correduria.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const reply = data?.reply;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    console.log("✅ ChatGPT montado");
  }, []);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg w-96 max-w-full z-50">
      <h3 className="text-lg font-bold mb-2">Asistente Virtual</h3>

      <div className="h-48 overflow-y-auto border p-2 mb-2 bg-gray-50 rounded">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm mb-1 whitespace-pre-wrap">{msg}</p>
        ))}
        {loading && <p className="text-gray-500 text-sm">⏳ ChatGPT está escribiendo...</p>}
      </div>

      <textarea
        className="w-full p-2 border border-gray-300 rounded mb-2"
        rows={2}
        placeholder="Haz tu pregunta..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        onClick={handleSend}
      >
        Enviar
      </button>
    </div>
  );
}
