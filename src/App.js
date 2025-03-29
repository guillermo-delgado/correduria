import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import WhatsappPage from "@/pages/whatsapp";
import LoginPage from "@/pages/login";
function App() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);
    return user ? (_jsx(WhatsappPage, {})) : (_jsx(LoginPage, { onLogin: (user) => setUser(user) }));
}
export default App;
