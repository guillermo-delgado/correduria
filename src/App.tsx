import { useState, useEffect } from "react";
import WhatsappPage from "@/pages/whatsapp";
import LoginPage from "@/pages/login";

//console.log("🟢 Iniciando aplicación...");

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   // console.log("✅ App.tsx montado");
    const storedUser = localStorage.getItem("user");
   // console.log("📦 localStorage.getItem('user'):", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        //console.log("✅ Usuario cargado correctamente:", parsedUser);
      } catch (err) {
       // console.error("❌ Error al parsear el usuario:", err);
      }
    } else {
      console.warn("⚠️ No hay usuario en localStorage");
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Cargando...</div>;

  return user ? (
    <WhatsappPage />
  ) : (
    <LoginPage
      onLogin={(user) => {
        console.log("🔐 Usuario autenticado:", user);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }}
    />
  );
}

export default App;
