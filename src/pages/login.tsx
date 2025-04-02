import { useEffect, useState } from "react";

// ✅ Base de la API desde .env o localhost
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleLoaded) return;

    window.google.accounts.id.initialize({
      client_id: "945516481273-r5af5fsg05r3f242l92o45c3qge7mg5c.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-button")!,
      { theme: "filled_blue", size: "large", text: "signin_with", shape: "pill" }
    );
  }, [googleLoaded]);

  const handleCredentialResponse = (response: any) => {
    console.log("🔐 Token recibido:", response.credential);

    const idToken = response.credential;
    const apiUrl = `${apiBase}/api/auth/google`;

    console.log("📡 URL de login que se usará:", apiUrl);

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        const user = {
          ...data.user,
          avatar: data.user.avatar || data.user.picture || null,
        };
        localStorage.setItem("user", JSON.stringify(user));
        onLogin(user);
      })
      .catch((err) => console.error("❌ Error de autenticación:", err));
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Iniciar sesión</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Accede con tu cuenta de Google para continuar
        </p>
        <div id="google-button" className="flex justify-center" />
      </div>
    </div>
  );
}
