import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3001");
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001";

type Chat = {
  id: number;
  name: string;
  messages: string[];
  sessionId?: string;
};

function stripHTML(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export default function WhatsappPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  const cargarSesionesDesdeBackend = async () => {
    if (!user) return;
    try {
      const url = `${apiBase}/api/user/debug/sesiones/${user._id}`;
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data.sesiones)) {
        const sesionesOrdenadas = [...data.sesiones].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );

        const conversaciones = sesionesOrdenadas
          .map((s, index) => {
            const mensajesFiltrados = s.messages.filter((m: any) => m.role !== 'system');
            if (mensajesFiltrados.length === 0) return null;

            const messages = mensajesFiltrados.map((m: any) => {
              const prefix = m.role === 'user' ? '🧑‍💼 Tú: ' : '🤖|HTML|';
              return prefix + m.content;
            });

            return {
              id: s.sessionId,
              name: s.name || `Asistente ${index + 1}`,
              sessionId: s.sessionId,
              messages,
            };
          })
          .filter(Boolean);

        setChats(conversaciones as Chat[]);
      }
    } catch (error) {
      console.error("❌ Error cargando sesiones desde el backend:", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    if (user) cargarSesionesDesdeBackend();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    socket.on('actualizarChats', cargarSesionesDesdeBackend);
    return () => {
      socket.off('actualizarChats', cargarSesionesDesdeBackend);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const updateChatMessages = (chatId: number, newMessages: string[]) => {
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId ? { ...chat, messages: newMessages } : chat
      );

      const reordered = [
        ...updated.filter((chat) => chat.id === chatId),
        ...updated.filter((chat) => chat.id !== chatId),
      ];

      return reordered;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;

    const userMessage = `🧑‍💼 Tú: ${input}`;
    const newMessages = [...activeChat.messages, userMessage];
    updateChatMessages(activeChatId, newMessages);
    setInput('');
    setLoading(true);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) {
      updateChatMessages(activeChatId, [
        ...newMessages,
        '❌ No se encontró información del usuario.',
      ]);
      setLoading(false);
      return;
    }

    let sessionId = chats.find(c => c.id === activeChatId)?.sessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId ? { ...chat, sessionId } : chat
        )
      );
    }

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId, userId: user._id }),
      });

      const text = await res.text();
      const data = JSON.parse(text);
      const reply: string = data?.reply ?? '';
      if (!reply) throw new Error("Respuesta vacía");

      const dirtyHtml = await marked.parse(reply);
      const html = DOMPurify.sanitize(dirtyHtml);
      const isHtml = html.includes('<table');
      const cleaned = isHtml ? html : html.replace(/^<p>(.*?)<\/p>\s*$/s, '$1');

      const finalMessages = [...newMessages, isHtml ? `🤖|HTML|${cleaned}` : `🤖 ${cleaned}`];
      updateChatMessages(activeChatId, finalMessages);
      socket.emit('mensajeEnviado');
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
    const totalAsistentes = chats.filter(chat => chat.name.startsWith("Asistente")).length;
    const newId = chats.length > 0 ? Math.max(...chats.map(c => Number(c.id))) + 1 : 1;

    const newChat: Chat = {
      id: newId,
      name: `Asistente ${totalAsistentes + 1}`,
      messages: ['🤖 Asistente: Hola, soy tu nuevo asistente. ¿Qué necesitas?'],
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newId);
    setIsMobileChatOpen(true);
  };

  const deleteChat = (chatId: number) => {
    const updated = chats.filter((chat) => chat.id !== chatId);
    setChats(updated);

    if (chatId === activeChatId) {
      if (updated.length > 0) {
        setActiveChatId(updated[0].id);
      } else {
        setActiveChatId(0);
      }
    }
  };

  const openChat = (chatId: number) => {
    setActiveChatId(chatId);
    setIsMobileChatOpen(true);
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <div className="flex h-full w-full">
        <aside className={`${isMobileChatOpen ? 'hidden' : 'flex'} lg:flex w-full lg:w-1/3 bg-white border-r relative flex-col`}>
          <div className="px-4 py-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
              {user?.avatar && <img src={user.avatar} className="w-9 h-9 rounded-full" alt="avatar" />}
              <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]">{user?.nombre}</span>
            </div>
            {showMenu && (
              <div className="absolute left-4 top-16 bg-white border rounded-lg shadow-md z-50 p-2">
                <button onClick={logout} className="text-sm bg-blue-200 text-blue-600 hover:text-blue-100 transition font-medium">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <ul className="overflow-auto flex-1">
            {chats.map((chat) => (
              <li
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className={`group p-4 cursor-pointer hover:bg-gray-100 transition flex justify-between items-center ${activeChatId === chat.id ? 'bg-gray-100' : ''}`}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  title="Eliminar chat"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 ml-2"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>

          <button onClick={handleNewChat} title="Nuevo chat" className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-2xl flex items-center justify-center shadow-md transition">
            +
          </button>
        </aside>

        <main className={`${isMobileChatOpen ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gray-50`}>
          <header className="p-4 border-b bg-white shadow-sm font-medium text-gray-800 flex items-center">
            {activeChat && (
              <>
                <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {activeChat.name.charAt(0)}
                </div>
                <span className="ml-2">{activeChat.name}</span>
              </>
            )}
            <button onClick={() => setIsMobileChatOpen(false)} className="ml-auto lg:hidden bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-200 transition">
              ← Volver
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeChat?.messages.map((msg, i) => {
              const isUser = msg.startsWith('🧑‍💼');
              const isBotHtml = msg.startsWith('🤖|HTML|');
              const cleanMsg = isBotHtml ? msg.replace('🤖|HTML|', '') : msg;

              return (
                <div key={i} className={`text-sm ${isUser ? 'text-right text-blue-600' : 'text-left text-gray-800'}`}>
                  {isBotHtml ? (
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl shadow-sm max-w-[70%] ${isUser ? 'bg-blue-100 ml-auto' : 'bg-white'}`}
                      dangerouslySetInnerHTML={{ __html: cleanMsg }}
                    />
                  ) : (
                    <div className={`inline-block px-4 py-2 rounded-2xl shadow-sm max-w-[70%] ${isUser ? 'bg-blue-100 ml-auto' : 'bg-white'}`}>
                      {cleanMsg}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && <div className="text-sm text-gray-400 italic">⏳ Asistente está escribiendo...</div>}
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
            <button onClick={handleSend} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow">
              Enviar
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
