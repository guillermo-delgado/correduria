import { useState, useEffect } from "react";
import WhatsappPage from "@/pages/whatsapp";
import LoginPage from "@/pages/login";


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hook para actualización PWA


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
