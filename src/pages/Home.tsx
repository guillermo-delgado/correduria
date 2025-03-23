
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { Button } from "@/components/ui/Button";


export default function Home() {
  return (
    
    <div className="bg-gray-50 text-gray-900 min-h-screen w-screen">
    

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 min-h-screen w-screen bg-gray-100">
        <h2 className="text-4xl font-bold mb-4">Protege lo que más importa</h2>
        <p className="text-lg text-gray-600 max-w-xl">
          Expertos en seguros de vida, hogar, auto y empresa. Encuentra la mejor cobertura para ti y tu familia.
        </p>
        <Button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">Ver Servicios</Button>
      </section>

      {/* Servicios */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <h2 className="text-center text-base/7 font-semibold text-indigo-600">Nuestros Servicios</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-gray-950 sm:text-5xl">Encuentra el seguro ideal para ti</p>
          <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Seguros de Vida</p>
                </div>
                <div className="relative min-h-[30rem] w-full grow">
                <img className="w-full max-lg:max-w-xs" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTddH5qf3gmTMGrY4F0Fpz57m41hcsExjoF2g&s" alt="Seguros de Auto" />
                </div>
              </div>
            </div>
            <div className="relative max-lg:row-start-1">
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Seguros de Hogar</p>
                </div>
                <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                  <img className="w-full max-lg:max-w-xs" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTddH5qf3gmTMGrY4F0Fpz57m41hcsExjoF2g&s" alt="Seguros de Hogar" />
                </div>
              </div>
            </div>
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">Seguros de Auto</p>
                </div>
                <div className="relative min-h-[30rem] w-full grow">
                  <img className="w-full max-lg:max-w-xs" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTddH5qf3gmTMGrY4F0Fpz57m41hcsExjoF2g&s" alt="Seguros de Auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <section id="contact" className="py-20 bg-gray-100 text-center w-screen">
        <h3 className="text-3xl font-semibold mb-6">Contáctanos</h3>
        <div className="flex justify-center space-x-6 text-gray-700">
          <div className="flex items-center space-x-2">
            <FaPhoneAlt /> <span>+34 600 123 456</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaEnvelope /> <span>info@correduria.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt /> <span>Granada, España</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 text-white text-center w-screen">
        <p>&copy; 2025 Correduría Integral. Todos los derechos reservados.</p>
      </footer>
     
    </div>
    
  );
}