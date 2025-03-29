import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function SWUpdater() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateSW, setUpdateSW] = useState(null);
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
    return updateAvailable && updateSW ? (_jsxs("div", { className: "fixed bottom-4 left-4 bg-yellow-300 text-black px-4 py-2 rounded shadow-lg z-50", children: [_jsx("p", { children: "\uD83D\uDD04 Nueva versi\u00F3n disponible" }), _jsx("button", { className: "mt-2 px-3 py-1 bg-black text-white rounded", onClick: () => updateSW(), children: "Actualizar" })] })) : null;
}
