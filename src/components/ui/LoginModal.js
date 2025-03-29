import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ui/LoginModal.tsx
import { Dialog } from "@headlessui/react";
import { useState } from "react";
const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Enviar login con email:", email);
        // Aquí integrarás la lógica con Google o Apple más adelante
    };
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, className: "relative z-50", children: [_jsx("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), _jsx("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: _jsxs(Dialog.Panel, { className: "bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4", children: [_jsx(Dialog.Title, { className: "text-xl font-bold", children: "Accede a tu cuenta" }), _jsxs("button", { onClick: () => {
                                window.location.href = "http://localhost:5000/auth/google";
                            }, className: "w-full flex items-center justify-center gap-2 bg-white border text-gray-700 rounded-lg px-4 py-2 mb-4 shadow-sm hover:bg-gray-50 transition", children: [_jsx("img", { src: "https://developers.google.com/identity/images/g-logo.png", alt: "Google logo", className: "w-5 h-5" }), _jsx("span", { children: "Iniciar sesi\u00F3n con Google" })] })] }) })] }));
};
export default LoginModal;
