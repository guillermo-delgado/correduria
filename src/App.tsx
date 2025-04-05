import { useState, useEffect } from "react";
import WhatsappPage from "@/pages/whatsapp";
import LoginPage from "@/pages/login";
import { usePwaUpdater } from "@/hooks/usePwaUpdater";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hook para actualización PWA
  const { needRefresh, updateServiceWorker } = usePwaUpdater();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.warn("❌ Error al parsear el usuario:", err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Cargando...</div>;

  return (
    <>
      {needRefresh && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50">
          Nueva versión disponible.
          <button
            onClick={() => updateServiceWorker(true)}
            className="ml-2 underline"
          >
            Actualizar
          </button>
        </div>
      )}

      {user ? (
        <WhatsappPage />
      ) : (
        <LoginPage
          onLogin={(user) => {
            console.log("🔐 Usuario autenticado:", user);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);
          }}
        />
      )}
    </>
  );
}

export default App;
