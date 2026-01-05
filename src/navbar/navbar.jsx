import { useEffect, useMemo, useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSignOut } from "../auth/useSignOut";

const getInitials = (fullName, email) => {
  if (fullName && typeof fullName === "string") {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() ?? null;
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (email && typeof email === "string" && email.length > 0) {
    return email[0].toUpperCase();
  }

  return null;
};

const Navbar = ({
  user,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse,
  onToggleMobileSidebar,
  activeView = "dashboard",
  activeOrderState = null,
}) => {
  const { signOut } = useSignOut();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = useMemo(
    () => getInitials(user?.fullName, user?.email) ?? "US",
    [user?.fullName, user?.email]
  );

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
  };

  const handleToggleSidebarCollapse = () => {
    if (typeof onToggleSidebarCollapse === "function") {
      onToggleSidebarCollapse();
    }
  };

  const handleToggleMobileSidebar = () => {
    if (typeof onToggleMobileSidebar === "function") {
      onToggleMobileSidebar();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const orderStateLabels = {
    ingresada: "Ingresada",
    pendiente: "Pendiente",
    procesada: "Procesada",
    error: "Error",
    en_proceso: "En proceso",
    descartada: "Descartada",
  };

  const breadcrumb = (() => {
    switch (activeView) {
      case "stores":
        return "Tiendas";
      case "orders":
        return activeOrderState
          ? `Órdenes · ${orderStateLabels[activeOrderState] ?? activeOrderState}`
          : "Órdenes";
      case "detailsOrders":
        return "Órdenes · Detalle";
      case "products":
        return "Productos";
      case "price":
        return "Precios";
      case "recycle":
        return "Papelera de Reciclaje";
      case "dashboard":
      default:
        return "Dashboard";
    }
  })();

  return (
    <header className="sticky top-0 z-30 relative w-full bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200/60">
      {/* Botón de colapsar/expandir pegado al borde izquierdo en desktop */}
      <button
        type="button"
        onClick={handleToggleSidebarCollapse}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 lg:flex"
        aria-label={
          isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"
        }
        title={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
      >
        {isSidebarCollapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </button>
      <nav className="flex h-16 w-full justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl items-center gap-3 lg:pl-12">
          <button
            type="button"
            onClick={handleToggleMobileSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 lg:hidden"
            aria-label="Abrir barra lateral"
          >
            <MenuIcon fontSize="small" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">
              {breadcrumb}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={toggleMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                {initials}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 z-20 mt-3 w-68 rounded-xl border border-slate-100 bg-white p-4 shadow-lg">
                  <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold text-white">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">
                        {user?.fullName || "Usuario"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {user?.email || "Sin correo disponible"}
                      </span>
                      <span className="mt-1 inline-flex w-fit rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                        {user?.role || "Rol no definido"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
