import { useState } from "react";
import { sendMessageToChatGPT } from "@/api/chat";
import { marked } from "marked";

export default function ChatGPT() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const message = input;
    setInput(""); // Limpia el input inmediatamente
    const reply = await sendMessageToChatGPT(message);
    setResponse(reply);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg w-96 max-w-full z-50">
      <h3 className="text-lg font-bold mb-2">Asistente Virtual</h3>

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

      {response && (
        <div
          className="mt-4 p-2 border-t border-gray-200 text-sm text-gray-700 prose max-w-full overflow-auto"
          dangerouslySetInnerHTML={{ __html: marked.parse(response) }}
        />
      )}
    </div>
  );
}
