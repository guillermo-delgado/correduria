import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { Pencil, Trash2 } from "lucide-react";


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
  const [editNameId, setEditNameId] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');
  const [editingHeaderName, setEditingHeaderName] = useState(false);
  const [tempHeaderName, setTempHeaderName] = useState('');


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

  const renameChat = async (chatId: number, newName: string) => {
    try {
      await fetch(`${apiBase}/api/history/rename/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      setChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, name: newName } : chat
      ));
      socket.emit('mensajeEnviado');
    } catch (err) {
      console.error("❌ Error renombrando chat:", err);
    }
  };
  
  const deleteChatFromBackend = async (sessionId: string) => {
    try {
      await fetch(`${apiBase}/api/history/delete/${sessionId}`, {
        method: 'DELETE',
      });
        
      socket.emit('mensajeEnviado');
    } catch (err) {
      console.error("❌ Error al eliminar chat del backend:", err);
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
    const chatToDelete = chats.find((chat) => chat.id === chatId);
    if (!chatToDelete) return;
  
    if (chatToDelete.sessionId) {
      deleteChatFromBackend(chatToDelete.sessionId);
    }
  
    const updated = chats.filter((chat) => chat.id !== chatId);
    setChats(updated);
  
    if (chatId === activeChatId) {
      setActiveChatId(updated.length > 0 ? updated[0].id : 0);
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
                  {editNameId === chat.id ? (
  <input
    autoFocus
    value={tempName}
    onChange={(e) => setTempName(e.target.value)}
    onBlur={() => {
      renameChat(chat.id, tempName);
      setEditNameId(null);
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        renameChat(chat.id, tempName);
        setEditNameId(null);
      }
    }}
    className="text-sm font-medium text-gray-800 border border-gray-300 rounded px-2 py-1"
  />
) : (
  <div
    onDoubleClick={() => {
      setEditNameId(chat.id);
      setTempName(chat.name);
    }}
    className="font-medium text-gray-800"
  >
    {chat.name}
  </div>
)}

                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                      {stripHTML(chat.messages.at(-1) ?? '').slice(0, 30)}
                    </div>
                  </div>
                </div>
                <span
  onClick={(e) => {
    e.stopPropagation();
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este chat?");
    if (confirmed) deleteChat(chat.id);
  }}
  title="Eliminar chat"
  className="text-gray-400 hover:text-red-500 ml-2 cursor-pointer transition-colors"
>
  <Trash2 size={22} />
</span>



                

              </li>
            ))}
          </ul>

          <button onClick={handleNewChat} title="Nuevo chat" className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-2xl flex items-center justify-center shadow-md transition">
            +
          </button>
        </aside>

        <main className={`${isMobileChatOpen ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gray-50`}>
        <header className="p-4 border-b bg-white shadow-sm font-medium text-gray-800 flex items-center relative">
  {activeChat && (
    <>
      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
        {activeChat.name.charAt(0)}
      </div>

      {editingHeaderName ? (
        <input
          autoFocus
          value={tempHeaderName}
          onChange={(e) => setTempHeaderName(e.target.value)}
          onBlur={() => {
            renameChat(activeChat.id, tempHeaderName);
            setEditingHeaderName(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              renameChat(activeChat.id, tempHeaderName);
              setEditingHeaderName(false);
            }
          }}
          className="ml-2 text-sm font-medium text-gray-800 border border-gray-300 rounded px-2 py-1"
        />
      ) : (
        <div className="ml-2 flex items-center gap-1">
          <span className="font-medium text-gray-800">{activeChat.name}</span>
          <span ml-2
            onClick={() => {
              setEditingHeaderName(true);
              setTempHeaderName(activeChat.name);
            }}
            title="Editar nombre"
            className="cursor-pointer text-gray-400 hover:text-blue-500"
          >
            <Pencil size={18} />
          </span>
        </div>
      )}
    </>
  )}

  <span
    onClick={() => setIsMobileChatOpen(false)}
    title="Cerrar chat"
    className="ml-auto lg:hidden text-[22px] text-red-500 hover:text-red-600 cursor-pointer leading-none"
  >
    ❌
  </span>
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
