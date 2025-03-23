// src/components/SWUpdater.tsx
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function SWUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      setUpdateAvailable(true);
    },
    onOfflineReady() {
      console.log("⚙️ App lista para usarse sin conexión");
    }
  });

  return updateAvailable ? (
    <div className="fixed bottom-4 left-4 bg-yellow-300 text-black px-4 py-2 rounded shadow-lg z-50">
      <p>🔄 Nueva versión disponible</p>
      <button
        className="mt-2 px-3 py-1 bg-black text-white rounded"
        onClick={() => updateServiceWorker(true)}
      >
        Actualizar
      </button>
    </div>
  ) : null;
}
