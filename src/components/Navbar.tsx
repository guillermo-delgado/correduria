import { useState } from "react";
import { Menu, X } from "lucide-react";
import LoginModal from "./ui/LoginModal"; // Asegúrate de tener este componente

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Correduría Integral</h1>
          </div>

          {/* Enlaces centrados (solo en escritorio) */}
          <nav className="hidden md:flex flex-1 justify-center gap-6 text-gray-700">
            <a href="#services" className="hover:text-blue-600">Servicios</a>
            <a href="#about" className="hover:text-blue-600">Sobre Nosotros</a>
            <a href="#contact" className="hover:text-blue-600">Contacto</a>
          </nav>

          {/* Botón de acceso a la derecha */}
          <div className="flex-1 flex justify-end items-center">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="hidden md:inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Acceso / Registro
            </button>

            {/* Botón hamburguesa móvil */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-gray-700"
              aria-label="Abrir menú"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de login */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Drawer móvil */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Menú</span>
          <button onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-4 text-gray-700">
          <a href="#services" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Servicios</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Sobre Nosotros</a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-blue-600">Contacto</a>
          <button
            onClick={() => {
              setIsLoginOpen(true);
              setIsOpen(false);
            }}
            className="hover:text-blue-600 text-left"
          >
            Acceso / Registro
          </button>
        </nav>
      </div>

      {/* Fondo oscuro solo en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
