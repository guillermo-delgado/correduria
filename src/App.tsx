import Home from "@/pages/Home";
import ChatGPT from "@/components/ui/ChatGPT";
import SWUpdater from "@/components/SWUpdater"; 
import Navbar from "./components/Navbar";

// 👇 Añadimos un console.log para forzar deploy
console.log("Forzar deploy correcto 🚀");

function App() {
  return (
    <>
      <Navbar />
      {/* Añade padding arriba para que no quede oculto detrás del navbar */}
      <div className="pt-32">
        <Home />
      </div>
      <ChatGPT />
      <SWUpdater />
    </>
  );
}

export default App;
