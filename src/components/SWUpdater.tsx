// src/components/SWUpdater.tsx
import { useEffect, useState } from "react";

export default function SWUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Importación dinámica compatible con Vite PWA
    import('virtual:pwa-register').then((mod: any) => {
      const { registerSW } = mod;
      const update = registerSW({
        onNeedRefresh() {
          setUpdateAvailable(true);
        },
        onOfflineReady() {
          console.log("⚙️ App lista para funcionar sin conexión");
        }
      });

      setUpdateSW(() => () => update(true));
    });
  }, []);

  if (!updateAvailable || !updateSW) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-300 text-black px-4 py-2 rounded shadow-lg z-50">
      <p>🔄 Nueva versión disponible</p>
      <button
        onClick={updateSW}
        className="mt-2 px-3 py-1 bg-black text-white rounded"
      >
        Actualizar
      </button>
    </div>
  );
}
