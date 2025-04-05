// src/components/ui/LoginModal.tsx
import { Dialog } from "@headlessui/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const handleGoogleLogin = () => {
    const isLocalhost = window.location.hostname === "localhost";
    const backendURL = isLocalhost
      ? "http://localhost:5000"
      : "https://back-end-correduria.onrender.com";

    window.location.href = `${backendURL}/auth/google`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
          <Dialog.Title className="text-xl font-bold">Accede a tu cuenta</Dialog.Title>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border text-gray-700 rounded-lg px-4 py-2 mb-4 shadow-sm hover:bg-gray-50 transition"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google logo"
              className="w-5 h-5"
            />
            <span>Iniciar sesión con Google</span>
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;
