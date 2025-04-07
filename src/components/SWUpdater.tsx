import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function SWUpdater() {
  const [isMobile, setIsMobile] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      const isProd = !["localhost", "127.0.0.1"].includes(window.location.hostname);
      const isMobileDevice = window.innerWidth <= 768;

      if (isProd && isMobileDevice) {
        setShowUpdate(true);
      }
    },
    onOfflineReady() {
      console.log("📲 App lista sin conexión");
    },
  });

  // Detectar móvil al montar
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-yellow-300 text-black px-6 py-3 rounded-xl shadow-md z-50 flex items-center justify-between">
      <span className="text-sm font-medium">🔄 Nueva versión disponible</span>
      <button
        className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition"
        onClick={() => updateServiceWorker(true)}
      >
        Actualizar
      </button>
    </div>
  );
}
