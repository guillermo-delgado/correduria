import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
function stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}
export default function WhatsappPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(1);
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const bottomRef = useRef(null);
    const activeChat = chats.find((chat) => chat.id === activeChatId) || null;
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (!storedUser) {
            navigate("/login");
        }
        else {
            setUser(storedUser);
        }
    }, [navigate]);
    useEffect(() => {
        const fetchAllHistories = async () => {
            const sessionIds = JSON.parse(localStorage.getItem("sessionIds") || "[]");
            const restoredChats = await Promise.all(sessionIds.map(async (sessionId, index) => {
                try {
                    const res = await fetch(`http://localhost:3001/api/history/${sessionId}`);
                    const data = await res.json();
                    if (data.history && Array.isArray(data.history)) {
                        const formattedMessages = data.history.map((msg) => {
                            const prefix = msg.role === "user" ? "🧑‍💼 Tú: " : "🤖|HTML|";
                            return prefix + msg.content;
                        });
                        return {
                            id: index + 1,
                            name: index === 0 ? "Asistente" : `Asistente ${index + 1}`,
                            sessionId,
                            messages: formattedMessages,
                        };
                    }
                }
                catch (error) {
                    console.error(`❌ Error al recuperar historial de sesión ${sessionId}:`, error);
                }
            }));
            setChats(restoredChats.filter(Boolean));
        };
        fetchAllHistories();
    }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);
    const updateChatMessages = (chatId, newMessages) => {
        setChats((prev) => prev.map((chat) => chat.id === chatId ? { ...chat, messages: newMessages } : chat));
    };
    const handleSend = async () => {
        if (!input.trim() || !activeChat)
            return;
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
            const existingIds = JSON.parse(localStorage.getItem("sessionIds") || "[]");
            if (!existingIds.includes(sessionId)) {
                localStorage.setItem("sessionIds", JSON.stringify([...existingIds, sessionId]));
            }
            setChats(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, sessionId } : chat));
        }
        try {
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, sessionId, userId: user._id }),
            });
            const text = await res.text();
            const data = JSON.parse(text);
            const reply = data?.reply ?? '';
            if (!reply)
                throw new Error("Respuesta vacía");
            const dirtyHtml = await marked.parse(reply);
            const html = DOMPurify.sanitize(dirtyHtml);
            const isHtml = html.includes('<table');
            const cleaned = isHtml ? html : html.replace(/^<p>(.*?)<\/p>\s*$/s, '$1');
            const finalMessages = [...newMessages, isHtml ? `🤖|HTML|${cleaned}` : `🤖 ${cleaned}`];
            updateChatMessages(activeChatId, finalMessages);
        }
        catch (error) {
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
        const newChat = {
            id: newId,
            name: `Asistente ${newId}`,
            messages: ['🤖 Asistente: Hola, soy tu nuevo asistente. ¿Qué necesitas?'],
        };
        setChats([newChat, ...chats]);
        setActiveChatId(newId);
        setIsMobileChatOpen(true);
    };
    const deleteChat = (chatId) => {
        const deletedChat = chats.find((chat) => chat.id === chatId);
        const updated = chats.filter((chat) => chat.id !== chatId);
        setChats(updated);
        // ✅ Eliminar el sessionId del localStorage
        if (deletedChat?.sessionId) {
            const existingIds = JSON.parse(localStorage.getItem("sessionIds") || "[]");
            const filtered = existingIds.filter((id) => id !== deletedChat.sessionId);
            localStorage.setItem("sessionIds", JSON.stringify(filtered));
        }
        // ✅ Si eliminamos el chat activo, actualizar
        if (chatId === activeChatId) {
            if (updated.length > 0) {
                setActiveChatId(updated[0].id);
            }
            else {
                setActiveChatId(0);
            }
        }
    };
    const openChat = (chatId) => {
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
    return (_jsx("div", { className: "w-full h-screen bg-gray-100", children: _jsxs("div", { className: "flex h-full w-full", children: [_jsxs("aside", { className: `${isMobileChatOpen ? 'hidden' : 'flex'} lg:flex w-full lg:w-1/3 bg-white border-r relative flex-col`, children: [_jsxs("div", { className: "px-4 py-4 border-b flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => setShowMenu(!showMenu), children: [user?.avatar ? (_jsx("img", { src: user.avatar, className: "w-9 h-9 rounded-full", alt: "avatar" })) : null, _jsx("span", { className: "font-medium text-gray-800 text-sm truncate max-w-[120px]", children: user?.nombre })] }), showMenu && (_jsx("div", { className: "absolute left-4 top-16 bg-white border rounded-lg shadow-md z-50 p-2", children: _jsx("button", { onClick: logout, className: "text-sm bg-blue-200 text-blue-600 hover:text-blue-100 transition font-medium", children: "Cerrar sesi\u00F3n" }) }))] }), _jsx("ul", { className: "overflow-auto flex-1", children: chats.map((chat) => (_jsxs("li", { onClick: () => openChat(chat.id), className: `group p-4 cursor-pointer hover:bg-gray-100 transition flex justify-between items-center ${activeChatId === chat.id ? 'bg-gray-100' : ''}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold", children: chat.name.charAt(0) }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-800", children: chat.name }), _jsx("div", { className: "text-xs text-gray-500 truncate max-w-[180px]", children: stripHTML(chat.messages.at(-1) ?? '').slice(0, 30) })] })] }), _jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.id);
                                        }, title: "Eliminar chat", className: "opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 ml-2", children: "\uD83D\uDDD1\uFE0F" })] }, chat.id))) }), _jsx("button", { onClick: handleNewChat, title: "Nuevo chat", className: "absolute bottom-4 right-4 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-2xl flex items-center justify-center shadow-md transition", children: "+" })] }), _jsxs("main", { className: `${isMobileChatOpen ? 'flex' : 'hidden'} lg:flex flex-1 flex-col bg-gray-50`, children: [_jsxs("header", { className: "p-4 border-b bg-white shadow-sm font-medium text-gray-800 flex items-center", children: [activeChat && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold", children: activeChat.name.charAt(0) }), _jsx("span", { className: "ml-2", children: activeChat.name })] })), _jsx("button", { onClick: () => setIsMobileChatOpen(false), className: "ml-auto lg:hidden bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm shadow-sm hover:bg-blue-200 transition", children: "\u2190 Volver" })] }), _jsxs("div", { className: "flex-1 p-4 overflow-y-auto space-y-4", children: [activeChat?.messages.map((msg, i) => {
                                    const isUser = msg.startsWith('🧑‍💼');
                                    const isBotHtml = msg.startsWith('🤖|HTML|');
                                    const cleanMsg = isBotHtml ? msg.replace('🤖|HTML|', '') : msg;
                                    return (_jsx("div", { className: `text-sm ${isUser ? 'text-right text-blue-600' : 'text-left text-gray-800'}`, children: _jsx("div", { className: `inline-block px-4 py-2 rounded-2xl shadow-sm max-w-[70%] ${isUser ? 'bg-blue-100 ml-auto' : 'bg-white'}`, ...(isBotHtml ? { dangerouslySetInnerHTML: { __html: cleanMsg } } : { children: cleanMsg }) }) }, i));
                                }), loading && _jsx("div", { className: "text-sm text-gray-400 italic", children: "\u23F3 Asistente est\u00E1 escribiendo..." }), _jsx("div", { ref: bottomRef })] }), _jsxs("footer", { className: "p-4 border-t bg-white flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Escribe un mensaje...", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSend(), className: "flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" }), _jsx("button", { onClick: handleSend, disabled: loading, className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow", children: "Enviar" })] })] })] }) }));
}
