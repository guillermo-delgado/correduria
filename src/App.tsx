import { useState, useEffect } from "react";
import WhatsappPage from "@/pages/whatsapp";
import LoginPage from "@/pages/login";

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return user ? (
    <WhatsappPage />
  ) : (
    <LoginPage onLogin={(user) => setUser(user)} />
  );
}

export default App;
// f