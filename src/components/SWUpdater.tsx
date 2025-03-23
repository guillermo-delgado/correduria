import { useEffect, useState } from "react";

export default function SWUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Importación dinámica que evita el error de compilación en Vite
    import('virtual:pwa-register').then(({ useRegisterSW }) => {
      const { updateServiceWorker, needRefresh } = useRegisterSW({
        onNeedRefresh() {
          setUpdateAvailable(true);
        },
        onOfflineReady() {
          console.log("⚙️ App lista sin conexión");
        },
      });

      setUpdateSW(() => () => updateServiceWorker(true));
    });
  }, []);

  return updateAvailable && updateSW ? (
    <div className="fixed bottom-4 left-4 bg-yellow-300 text-black px-4 py-2 rounded shadow-lg z-50">
      <p>🔄 Nueva versión disponible</p>
      <button
        className="mt-2 px-3 py-1 bg-black text-white rounded"
        onClick={() => updateSW()}
      >
        Actualizar
      </button>
    </div>
  ) : null;
}
