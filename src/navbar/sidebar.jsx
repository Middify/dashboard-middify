import { useEffect, useMemo, useRef, useState } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import LogoFull from "../assets/logo/logo-removebg-preview.png";
import LogoCompact from "../assets/logo/middify.png";

const ORDER_STATE_ITEMS = [
  { id: "ingresada", label: "Ingresada" },
  { id: "pendiente", label: "Pendiente" },
  { id: "procesada", label: "Procesada" },
  { id: "error", label: "Error" },
  { id: "en_proceso", label: "En proceso" },
  { id: "descartada", label: "Descartada" },
];

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 84;

const StatusDot = ({ active }) => (
  <span
    className={`inline-flex h-2.5 w-2.5 rounded-full transition-all duration-200 ${
      active ? "bg-white scale-110" : "bg-white/60"
    }`}
  />
);

const Sidebar = ({
  tenants = [],
  selectedTenantId = null,
  onChangeTenant,
  activeView = "dashboard",
  onChangeView,
  showTenantFilter = true,
  activeOrderState = null,
  onChangeOrderState,
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onCloseMobile = null,
}) => {
  const { hasValidTenants, tenantOptions } = useMemo(() => {
    if (!Array.isArray(tenants)) {
      return { hasValidTenants: false, tenantOptions: [] };
    }

    const options = tenants.filter(
      (tenant) => tenant?.tenantId && tenant?.tenantName
    );
    return { hasValidTenants: options.length > 0, tenantOptions: options };
  }, [tenants]);

  const handleViewChange = (view) => {
    if (typeof onChangeView === "function") {
      onChangeView(view);
    }
    closeMobileIfNeeded();
  };

  const handleTenantChange = (event) => {
    if (typeof onChangeTenant === "function") {
      const value = event.target.value;
      onChangeTenant(value === "all" ? null : value);
    }
  };

  const closeMobileIfNeeded = () => {
    if (isMobileOpen && typeof onCloseMobile === "function") {
      onCloseMobile();
    }
  };

  const [ordersExpanded, setOrdersExpanded] = useState(activeView === "orders");
  const [isAnimating, setIsAnimating] = useState(false);
  const effectiveCollapsed = isCollapsed && !isMobileOpen;
  const [tenantOpen, setTenantOpen] = useState(false);
  const tenantRef = useRef(null);

  useEffect(() => {
    if (effectiveCollapsed) {
      setOrdersExpanded(false);
      return;
    }
    if (activeView === "orders") {
      setOrdersExpanded(true);
    }
  }, [activeView, effectiveCollapsed]);

  const isDashboardActive = activeView === "dashboard";
  const isStoresActive = activeView === "stores";
  const isOrdersRootActive = activeView === "orders" && !activeOrderState;

  const handleOrderRootClick = () => {
    handleViewChange("orders");
    if (typeof onChangeOrderState === "function") {
      onChangeOrderState(null);
    }
    closeMobileIfNeeded();
  };

  const handleOrderStateClick = (stateId) => {
    const exists = ORDER_STATE_ITEMS.some((state) => state.id === stateId);
    if (!exists) {
      return;
    }
    handleViewChange("orders");
    if (typeof onChangeOrderState === "function") {
      onChangeOrderState(stateId);
    }
    closeMobileIfNeeded();
  };

  const handleOrdersToggle = async () => {
    if (effectiveCollapsed) {
      onToggleCollapse(false);
      return;
    }
    
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOrdersExpanded(prev => !prev);
    
    // Esperar a que la animación termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const renderSidebarBody = (collapsed) => {
    const headerPaddingX = collapsed ? "px-3" : "px-6";
    const headerPaddingTop = collapsed ? "pt-4" : "pt-6";
    const navPaddingX = collapsed ? "px-2" : "px-6";
    const navPaddingTop = collapsed ? "pt-2" : "pt-4";
    const footerPaddingX = collapsed ? "px-3" : "px-6";
    const navAlignment = collapsed ? "text-center" : "text-left";

    const primaryButtonClasses = (isActive) =>
      [
        "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-all duration-200",
        isActive ? "bg-white/12 border border-white/15 shadow-lg shadow-black/10" : "bg-transparent hover:bg-white/8 hover:border hover:border-white/10",
        collapsed ? "justify-center px-0" : "justify-start px-3.5 gap-3",
        isActive ? "before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1.5 before:rounded-r-full before:bg-white/90" : ""
      ]
        .filter(Boolean)
        .join(" ");

    const ordersButtonClasses = [
      "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-all duration-200",
      activeView === "orders" && ordersExpanded
        ? "bg-white/12 border border-white/15 shadow-lg shadow-black/10"
        : "bg-transparent hover:bg-white/8 hover:border hover:border-white/10",
      collapsed ? "justify-center px-0" : "justify-between px-3.5",
      activeView === "orders" && ordersExpanded ? "before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1.5 before:rounded-r-full before:bg-white/90" : ""
    ].join(" ");

    const renderIconWrapper = (icon, isActive) => (
      <div className={`h-8 w-8 rounded-xl grid place-items-center transition-all duration-200 ${isActive ? "bg-white/15 text-white" : "bg-white/10 text-white/90"}`}>
        {icon}
      </div>
    );

    const selectedTenantOption = (hasValidTenants && tenantOptions.find(t => t.tenantId === selectedTenantId)) || null;
    const selectedTenantLabel = selectedTenantOption ? selectedTenantOption.tenantName : "Todas las tiendas";

    return (
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className={`${headerPaddingX} ${headerPaddingTop}`}>
            <div className="flex flex-col items-center">
              <img
                src={collapsed ? LogoCompact : LogoFull}
                alt="Logo Middify"
                className={`transition-all duration-200 ${
                  collapsed ? "w-10" : "w-24"
                }`}
              />

              {showTenantFilter && !collapsed && (
                <div className="mt-4 w-full text-left">
                  <div className="h-px w-full bg-white/15 transition-all duration-200" />
                  <label
                    className="mt-3 block text-sm font-medium text-white/80 transition-colors duration-200"
                  >
                    Tienda
                  </label>
                  <div className="relative mt-1.5" ref={tenantRef}>
                    <button
                      type="button"
                      onClick={() => setTenantOpen((v) => !v)}
                      className={`w-full rounded-xl border ${tenantOpen ? "border-white/40 bg-white/15" : "border-white/25 bg-white/10"} px-3 py-2 pr-10 text-sm font-medium text-white outline-none transition-all duration-200 hover:border-white/40 hover:bg-white/12 focus:border-white/50 focus:bg-white/15`}
                      aria-haspopup="listbox"
                      aria-expanded={tenantOpen}
                      title="Seleccionar tienda"
                    >
                      <span className="truncate">{selectedTenantLabel}</span>
                      <ExpandMoreIcon className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/70 transition-transform duration-300 ${tenantOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div
                      className={`absolute z-10 mt-2 w-full rounded-xl border border-white/15 bg-[#063279]/95 backdrop-blur-sm shadow-xl shadow-black/20 transition-all duration-300 ease-out ${tenantOpen ? "max-h-[60vh] opacity-100 translate-y-0" : "pointer-events-none max-h-0 opacity-0 -translate-y-1"} ${tenantOpen ? "overflow-auto" : "overflow-hidden"}`}
                      role="listbox"
                      tabIndex={-1}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof onChangeTenant === "function") onChangeTenant(null);
                          setTenantOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-left transition-colors duration-150 ${selectedTenantId == null ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10 hover:text-white"}`}
                        role="option"
                        aria-selected={selectedTenantId == null}
                      >
                        <StatusDot active={selectedTenantId == null} />
                        <span>Todas las tiendas</span>
                      </button>
                      {hasValidTenants &&
                        tenantOptions.map((tenant) => {
                          const isActive = selectedTenantId === tenant.tenantId;
                          return (
                            <button
                              key={tenant.tenantId}
                              type="button"
                              onClick={() => {
                                if (typeof onChangeTenant === "function") onChangeTenant(tenant.tenantId);
                                setTenantOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 px-3 py-2 text-sm text-left transition-colors duration-150 ${isActive ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10 hover:text-white"}`}
                              role="option"
                              aria-selected={isActive}
                            >
                              <StatusDot active={isActive} />
                              <span className="truncate">{tenant.tenantName}</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              
              )}
            </div>
          </div>

          <div
            className={`${navPaddingX} ${navPaddingTop}`} 
          >
            <div className="my-2 h-px bg-white/10" />
            <nav className={`space-y-4 ${navAlignment}`}> 
              <div className="space-y-2"> 
                <button
                  type="button"
                  onClick={() => handleViewChange("dashboard")}
                  className={primaryButtonClasses(isDashboardActive)}
                >
                  {renderIconWrapper(<AssessmentIcon fontSize="small" />, isDashboardActive)}
                  {!collapsed && (
                    <span className={`transition-all duration-200 ${
                      isDashboardActive ? "text-white font-semibold" : "text-white/90"
                    }`}>
                      Dashboard
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleViewChange("stores")}
                  className={primaryButtonClasses(isStoresActive)}
                >
                  {renderIconWrapper(<ApartmentIcon fontSize="small" />, isStoresActive)}
                  {!collapsed && (
                    <span className={`transition-all duration-200 ${
                      isStoresActive ? "text-white font-semibold" : "text-white/90"
                    }`}>
                      Tiendas
                    </span>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                {!collapsed && (
                  <>
                    <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-white/45">Órdenes</p>
                    <div className="my-2 h-px bg-white/10" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleOrdersToggle}
                  className={ordersButtonClasses}
                >
                  <div
                    className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
                  >
                    {renderIconWrapper(<Inventory2Icon fontSize="small" />, activeView === "orders")}
                    {!collapsed && (
                      <span className={`transition-all duration-200 ${
                        activeView === "orders" ? "text-white font-semibold" : "text-white/90"
                      }`}>
                        Órdenes
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <ExpandMoreIcon
                      className={`text-white/70 transition-all duration-300 ${
                        ordersExpanded ? "rotate-180" : ""
                      }`}
                      fontSize="small"
                    />
                  )}
                </button>

                {!collapsed && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      ordersExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-2 space-y-1 border-l border-white/15 pl-4 pt-1">
                      <button
                        type="button"
                        onClick={handleOrderRootClick}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm transition-all duration-200 ${
                          isOrdersRootActive
                            ? "bg-white/15 font-semibold text-white shadow shadow-black/10"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <StatusDot active={isOrdersRootActive} />
                        <span>Todas</span>
                      </button>
                      {ORDER_STATE_ITEMS.map((state) => {
                        const isActive = activeOrderState === state.id;
                        return (
                          <button
                            key={state.id}
                            type="button"
                            onClick={() => handleOrderStateClick(state.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-white/15 font-semibold text-white shadow shadow-black/10"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`} // py reducido
                          >
                            <StatusDot active={isActive} />
                            <span>{state.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        <div className={`${footerPaddingX} pb-4`}>
          <div className={`mb-2 flex ${collapsed ? "justify-center" : "justify-end"}`}>
            <button
              type="button"
              aria-label="Papelera de reciclaje"
              className="rounded-xl p-2 text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              title="Papelera de reciclaje"
            >
              <RestoreFromTrashOutlinedIcon fontSize="small" />
            </button>
          </div>
          {!collapsed && (
            <div className="text-center text-xs text-white/50 transition-all duration-200">
              © {new Date().getFullYear()} Middify
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className="hidden sticky top-0 z-20 h-screen flex-shrink-0 bg-[#063279] text-white transition-all duration-200 lg:flex flex-col"
        style={{
          width: effectiveCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
      >
        {renderSidebarBody(effectiveCollapsed)}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Cerrar barra lateral"
            onClick={closeMobileIfNeeded}
            className="absolute inset-0 bg-black/60 transition-all duration-200"
          />
          <aside className="relative ml-0 flex h-full w-72 max-w-full flex-col bg-[#063279] text-white shadow-2xl transition-all duration-200">
            {renderSidebarBody(false)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;