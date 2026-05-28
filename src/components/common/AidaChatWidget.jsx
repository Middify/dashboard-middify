import { useState, useEffect } from "react";

export const AidaChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentDomain(encodeURIComponent(window.location.origin));
    }
  }, []);

  const chatUrl = `https://builder.prod.soyaida.com/public/chat/middify/eb70d6d7-fb8e-46f1-9b3d-23bdacbec67a?hostedDomain=${currentDomain}`;
  const middifyBlue = "#2563EB";

  return (
    <>
      {/* VENTANA DEL CHAT  */}
      <div
        className={`fixed bottom-[100px] right-6 z-[9999] transition-all duration-300 origin-bottom-right bg-white rounded-2xl overflow-hidden
          ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none"}
        `}
        style={{
          width: "380px",
          height: "600px",
          boxShadow:
            "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <iframe
          src={chatUrl}
          className="w-full h-full border-none"
          title="Soporte Middify"
        />
      </div>

      {/* BOTÓN FLOTANTE  */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full text-white flex justify-center items-center transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{
          backgroundColor: middifyBlue,
          boxShadow: `0 8px 20px ${middifyBlue}40`,
        }}
      >
        {isOpen ? (
          <span className="text-2xl font-bold transition-transform rotate-0 duration-300">
            ✕
          </span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="transition-transform duration-300 hover:-rotate-12"
          >
            <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
          </svg>
        )}
      </button>
    </>
  );
};
