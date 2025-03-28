import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { marked } from 'marked';

type Chat = {
  id: number;
  name: string;
  messages: string[];
};

function stripHTML(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export default function WhatsappPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Asistente',
      messages: ['🤖 Asistente: ¡Hola! ¿En qué puedo ayudarte hoy?'],
    },
  ]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat.messages]);

  const updateChatMessages = (chatId: number, newMessages: string[]) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, messages: newMessages } : chat
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = `🧑‍💼 Tú: ${input}`;
    const newMessages = [...activeChat.messages, userMessage];
    updateChatMessages(activeChatId, newMessages);
    setInput('');
    setLoading(true);

    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Date.now().toString();
      localStorage.setItem('sessionId', sessionId);
    }

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      const reply: string = data?.reply ?? '';
// s

const html = String(marked.parse(reply));
const isHtml = html.includes('<table');

      const cleaned = isHtml ? html : html.replace(/^<p>(.*?)<\/p>\s*$/s, '$1');

      const finalMessages = [...newMessages, isHtml ? `🤖|HTML|${cleaned}` : `🤖 ${cleaned}`];

      updateChatMessages(activeChatId, finalMessages);
    } catch (error) {
      updateChatMessages(activeChatId, [
        ...activeChat.messages,
        userMessage,
        '❌ Error de red o API.',
      ]);
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    const newId = chats.length + 1;
    const newChat: Chat = {
      id: newId,
      name: `Asistente ${newId}`,
      messages: ['🤖 Asistente: Hola, soy tu nuevo asistente. ¿Qué necesitas?'],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setIsMobileChatOpen(true);
  };

  const openChat = (chatId: number) => {
    setActiveChatId(chatId);
    setIsMobileChatOpen(true);
  };

  return (
    <div className="w-full h-screen bg-gray-100">
  <div className="flex h-full w-full">

        {/* LISTA DE CHATS */}
        <aside
          className={`${
            isMobileChatOpen ? 'hidden' : 'flex'
          } lg:flex w-full lg:w-1/3 bg-white border-r relative flex-col`}
        >
          <div className="px-4 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Chats</h2>
          </div>
          <ul className="overflow-auto flex-1">
            {chats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`p-4 cursor-pointer hover:bg-gray-100 transition ${
                  activeChatId === chat.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {chat.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{chat.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                      {stripHTML(chat.messages.at(-1) ?? '').slice(0, 30)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={handleNewChat}
            title="Nuevo chat"
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-2xl flex items-center justify-center shadow-md transition"
          >
            +
          </button>
        </aside>

        {/* CHAT */}
        <main
          className={`${
            isMobileChatOpen ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col bg-gray-50`}
        >
          <header className="p-4 border-b bg-white shadow-sm font-medium text-gray-800 flex items-center">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {activeChat.name.charAt(0)}
            </div>
            <span className="ml-2">{activeChat.name}</span>

            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="ml-auto lg:hidden bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-200 transition"
            >
              ← Volver
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeChat.messages.map((msg, i) => {
              const isUser = msg.startsWith('🧑‍💼');
              const isBotHtml = msg.startsWith('🤖|HTML|');
              const isBot = msg.startsWith('🤖');
              const cleanMsg = isBotHtml ? msg.replace('🤖|HTML|', '') : msg;

              return (
                <div
                  key={i}
                  className={`text-sm ${
                    isUser
                      ? 'text-right text-blue-600'
                      : 'text-left text-gray-800'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl shadow-sm max-w-[70%] ${
                      isUser ? 'bg-blue-100 ml-auto' : 'bg-white'
                    }`}
                    {...(isBotHtml
                      ? { dangerouslySetInnerHTML: { __html: cleanMsg } }
                      : { children: cleanMsg })}
                  />
                </div>
              );
            })}

            {loading && (
              <div className="text-sm text-gray-400 italic">
                ⏳ Asistente está escribiendo...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <footer className="p-4 border-t bg-white flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow"
            >
              Enviar
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}