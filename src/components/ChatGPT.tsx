import { useState } from "react";
import { sendMessageToChatGPT } from "@/api/chat";

export default function ChatGPT() {


  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg w-96 max-w-full">
      <h3 className="text-lg font-bold mb-2">Asistente Virtual</h3>


      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      
      >
        Enviar
      </button>

      
    </div>
  );
}
