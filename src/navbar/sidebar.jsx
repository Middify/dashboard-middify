import { useEffect, useMemo, useState } from "react";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LogoFull from "../assets/logo/logo-removebg-preview.png";
import LogoCompact from "../assets/logo/middify.png";
import { STATE_DEFINITIONS } from "../components/dashboard/CardsStates";

const PRIMARY_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: AssessmentIcon },
  { id: "stores", label: "Tiendas", Icon: ApartmentIcon },
];

const normalizeStateId = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const ORDER_STATE_ITEMS = STATE_DEFINITIONS.map(({ key, label }) => {
  const id = normalizeStateId(key);
  const displayLabel =
    id === "en_proceso" ? "En proceso" : label ?? key;
  return { id, label: displayLabel };
});

const PRODUCT_STATE_ITEMS = [
  { id: "creada", label: "Creada" },
  { id: "error", label: "Error" },
  { id: "procesada", label: "Procesada" },
];

export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 84;

const StatusDot = ({ active }) => (
  <span
    className={`inline-flex h-2.5 w-2.5 rounded-full transition-all duration-200 ${active ? "bg-white scale-110" : "bg-white/60"
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
  activeProductState = null,
  onChangeProductState,
  activePriceState = null,
  onChangePriceState,
  isCollapsed = false,
  onToggleCollapse = () => { },
  isMobileOpen = false,
  onCloseMobile = null,
  userRole = null,
}) => {
  const { hasValidTenants, tenantOptions } = useMemo(() => {
    if (!Array.isArray(tenants)) {
      return { hasValidTenants: false, tenantOptions: [] };
    }

    const options = tenants.filter(
      (tenant) => tenant?.tenantId && tenant?.tenantName
    );
    
    // Eliminar duplicados por tenantId
    const uniqueOptions = Array.from(new Map(options.map(t => [t.tenantId, t])).values());
    
    return { hasValidTenants: uniqueOptions.length > 0, tenantOptions: uniqueOptions };
  }, [tenants]);

  // Cálculo de visibilidad por módulos
  const visibility = useMemo(() => {
    if (!tenants || tenants.length === 0) {
      return { orders: false, stock: false, price: false };
    }

    // Si hay un tenant seleccionado, usamos su configuración específica
    if (selectedTenantId) {
      const selected = tenants.find(t => t.tenantId === selectedTenantId);
      if (selected) {
        return {
          orders: selected.orders === "active",
          stock: selected.stock === "active",
          price: selected.price === "active"
        };
      }
    }

    // Si estamos en "Todas las tiendas", mostramos el módulo si al menos uno está activo
    return {
      orders: tenants.some(t => t.orders === "active"),
      stock: tenants.some(t => t.stock === "active"),
      price: tenants.some(t => t.price === "active")
    };
  }, [tenants, selectedTenantId]);

  const handleViewChange = (view) => {
    if (typeof onChangeView === "function") {
      onChangeView(view);
    }
    closeMobileIfNeeded();
  };

  const closeMobileIfNeeded = () => {
    if (isMobileOpen && typeof onCloseMobile === "function") {
      onCloseMobile();
    }
  };

  const normalizedRole =
    typeof userRole === "string" && userRole.trim().length > 0
      ? userRole.trim().toLowerCase()
      : null;

  const primaryNavItems = useMemo(() => {
    if (normalizedRole === "user") {
      return PRIMARY_NAV_ITEMS.filter((item) => item.id !== "stores");
    }
    return PRIMARY_NAV_ITEMS;
  }, [normalizedRole]);

  const [ordersExpanded, setOrdersExpanded] = useState(activeView === "orders");
  const [productsExpanded, setProductsExpanded] = useState(activeView === "products");
  const [priceExpanded, setPriceExpanded] = useState(activeView === "price");
  const effectiveCollapsed = isCollapsed && !isMobileOpen;
  const [tenantOpen, setTenantOpen] = useState(false);

  useEffect(() => {
    if (effectiveCollapsed) {
      setOrdersExpanded(false);
      setProductsExpanded(false);
      setPriceExpanded(false);
      return;
    }
    if (activeView === "orders") {
      setOrdersExpanded(true);
    }
    if (activeView === "products") {
      setProductsExpanded(true);
    }
    if (activeView === "price") {
      setPriceExpanded(true);
    }
  }, [activeView, effectiveCollapsed]);

  useEffect(() => {
    if (effectiveCollapsed || !showTenantFilter) {
      setTenantOpen(false);
    }
  }, [effectiveCollapsed, showTenantFilter]);

  useEffect(() => {
    if (!isMobileOpen) {
      setTenantOpen(false);
    }
  }, [isMobileOpen]);

  const isOrdersRootActive = activeView === "orders" && !activeOrderState;
  const isProductsRootActive = activeView === "products" && !activeProductState;
  const isPriceRootActive = activeView === "price" && !activePriceState;

  const handleOrderRootClick = () => {
    if (typeof onChangeOrderState === "function") {
      onChangeOrderState(null);
    } else {
      handleViewChange("orders");
    }
    closeMobileIfNeeded();
  };

  const handleProductRootClick = () => {
    if (typeof onChangeProductState === "function") {
      onChangeProductState(null);
    } else {
      handleViewChange("products");
    }
    closeMobileIfNeeded();
  };

  const handleOrderStateClick = (stateId) => {
    if (typeof onChangeOrderState === "function") {
      onChangeOrderState(stateId);
    } else {
      handleViewChange("orders");
    }
    closeMobileIfNeeded();
  };

  const handleProductStateClick = (stateId) => {
    if (typeof onChangeProductState === "function") {
      onChangeProductState(stateId);
    } else {
      handleViewChange("products");
    }
    closeMobileIfNeeded();
  };

  const handlePriceRootClick = () => {
    if (typeof onChangePriceState === "function") {
      onChangePriceState(null);
    } else {
      handleViewChange("price");
    }
    closeMobileIfNeeded();
  };

  const handlePriceStateClick = (stateId) => {
    if (typeof onChangePriceState === "function") {
      onChangePriceState(stateId);
    } else {
      handleViewChange("price");
    }
    closeMobileIfNeeded();
  };

  const handleOrdersToggle = () => {
    if (effectiveCollapsed) {
      onToggleCollapse(false);
      handleOrderRootClick();
      return;
    }
    setOrdersExpanded((prev) => !prev);
  };

  const handleProductsToggle = () => {
    if (effectiveCollapsed) {
      onToggleCollapse(false);
      handleProductRootClick();
      return;
    }
    setProductsExpanded((prev) => !prev);
  };

  const handlePriceToggle = () => {
    if (effectiveCollapsed) {
      onToggleCollapse(false);
      handlePriceRootClick();
      return;
    }
    setPriceExpanded((prev) => !prev);
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
        "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-200",
        isActive ? "bg-white/10 text-white shadow-sm" : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
        collapsed ? "justify-center px-0" : "justify-start px-3.5 gap-3",
      ]
        .filter(Boolean)
        .join(" ");

    const ordersButtonClasses = [
      "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-200",
      activeView === "orders" && ordersExpanded
        ? "bg-white/10 text-white shadow-sm"
        : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
      collapsed ? "justify-center px-0" : "justify-between px-3.5",
    ].join(" ");

    const productsButtonClasses = [
      "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-200",
      activeView === "products" && productsExpanded
        ? "bg-white/10 text-white shadow-sm"
        : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
      collapsed ? "justify-center px-0" : "justify-between px-3.5",
    ].join(" ");

    const priceButtonClasses = [
      "relative flex w-full items-center rounded-2xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-200",
      activeView === "price" && priceExpanded
        ? "bg-white/10 text-white shadow-sm"
        : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
      collapsed ? "justify-center px-0" : "justify-between px-3.5",
    ].join(" ");

    const renderIconWrapper = (icon, isActive) => (
      <div className={`h-8 w-8 rounded-xl grid place-items-center transition-colors duration-200 ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-white/70"}`}>
        {icon}
      </div>
    );

    const selectedTenantOption = (hasValidTenants && tenantOptions.find(t => t.tenantId === selectedTenantId)) || null;
    const selectedTenantLabel = selectedTenantOption ? selectedTenantOption.tenantName : "Todas las tiendas";

    return (
      <div className="flex h-full flex-col">
        <div>
          <div className={`${headerPaddingX} ${headerPaddingTop}`}>
            <div className="flex flex-col items-center">
              <img
                src={collapsed ? LogoCompact : LogoFull}
                alt="Logo Middify"
                className={`transition-all duration-200 ${collapsed ? "w-10" : "w-24"
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
                  <div className="relative mt-1.5">
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
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <div className={`${navPaddingX} ${navPaddingTop}`}>
            <div className="my-2 h-px bg-white/10" />
            <nav className={`space-y-4 ${navAlignment}`}>
              <div className="space-y-2">
                {primaryNavItems.map(({ id, label, Icon }) => {
                  const isActive = activeView === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleViewChange(id)}
                      className={primaryButtonClasses(isActive)}
                    >
                      {renderIconWrapper(<Icon fontSize="small" />, isActive)}
                      {!collapsed && (
                        <span
                          className={`transition-colors duration-200 ${isActive ? "text-white font-semibold" : "text-white/80 group-hover:text-white"
                            }`}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {!collapsed && (
                  <>
                    <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-white/45">Inventario</p>
                    <div className="my-2 h-px bg-white/10" />
                  </>
                )}
                
                {visibility.stock && (
                  <button
                    type="button"
                    onClick={handleProductsToggle}
                    className={productsButtonClasses}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
                    >
                      {renderIconWrapper(<Inventory2Icon fontSize="small" />, activeView === "products")}
                      {!collapsed && (
                        <span className={`transition-colors duration-200 ${activeView === "products" ? "text-white font-semibold" : "text-white/80 group-hover:text-white"
                          }`}>
                          Productos
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ExpandMoreIcon
                        className={`text-white/70 transition-all duration-300 ${productsExpanded ? "rotate-180" : ""
                          }`}
                        fontSize="small"
                      />
                    )}
                  </button>
                )}

                {visibility.stock && !collapsed && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${productsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="ml-2 space-y-1 border-l border-white/15 pl-4 pt-1">
                      <button
                        type="button"
                        onClick={handleProductRootClick}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isProductsRootActive
                            ? "bg-white/10 font-medium text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <StatusDot active={isProductsRootActive} />
                        <span>Todos</span>
                      </button>
                      {PRODUCT_STATE_ITEMS.map((state) => {
                        const isActive = activeProductState === state.id;
                        return (
                          <button
                            key={state.id}
                            type="button"
                            onClick={() => handleProductStateClick(state.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isActive
                                ? "bg-white/10 font-medium text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                              }`}
                          >
                            <StatusDot active={isActive} />
                            <span>{state.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {visibility.price && (
                  <button
                    type="button"
                    onClick={handlePriceToggle}
                    className={priceButtonClasses}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
                    >
                      {renderIconWrapper(<AttachMoneyIcon fontSize="small" />, activeView === "price")}
                      {!collapsed && (
                        <span className={`transition-colors duration-200 ${activeView === "price" ? "text-white font-semibold" : "text-white/80 group-hover:text-white"
                          }`}>
                          Precio
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ExpandMoreIcon
                        className={`text-white/70 transition-all duration-300 ${priceExpanded ? "rotate-180" : ""
                          }`}
                        fontSize="small"
                      />
                    )}
                  </button>
                )}

                {visibility.price && !collapsed && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${priceExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="ml-2 space-y-1 border-l border-white/15 pl-4 pt-1">
                      <button
                        type="button"
                        onClick={handlePriceRootClick}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isPriceRootActive
                          ? "bg-white/10 font-medium text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <StatusDot active={isPriceRootActive} />
                        <span>Todos</span>
                      </button>
                      {PRODUCT_STATE_ITEMS.map((state) => {
                        const isActive = activePriceState === state.id;
                        return (
                          <button
                            key={state.id}
                            type="button"
                            onClick={() => handlePriceStateClick(state.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isActive
                              ? "bg-white/10 font-medium text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                              }`}
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

              <div className="space-y-2">
                {!collapsed && (visibility.orders) && (
                  <>
                    <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-white/45">Órdenes</p>
                    <div className="my-2 h-px bg-white/10" />
                  </>
                )}
                {visibility.orders && (
                  <button
                    type="button"
                    onClick={handleOrdersToggle}
                    className={ordersButtonClasses}
                  >
                    <div
                      className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}
                    >
                      {renderIconWrapper(<ShoppingCartIcon fontSize="small" />, activeView === "orders")}
                      {!collapsed && (
                        <span className={`transition-colors duration-200 ${activeView === "orders" ? "text-white font-semibold" : "text-white/80 group-hover:text-white"
                          }`}>
                          Órdenes
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <ExpandMoreIcon
                        className={`text-white/70 transition-all duration-300 ${ordersExpanded ? "rotate-180" : ""
                          }`}
                        fontSize="small"
                      />
                    )}
                  </button>
                )}

                {visibility.orders && !collapsed && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${ordersExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <div className="ml-2 space-y-1 border-l border-white/15 pl-4 pt-1">
                      <button
                        type="button"
                        onClick={handleOrderRootClick}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isOrdersRootActive
                            ? "bg-white/10 font-medium text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
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
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${isActive
                                ? "bg-white/10 font-medium text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                              }`}
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

        <div className={`mt-auto ${footerPaddingX} pb-4 border-t border-white/10`}>
          <div className={`pt-3 mb-2 flex justify-center`}>
            <button
              type="button"
              aria-label="Papelera de reciclaje"
              className={`rounded-xl text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white ${collapsed ? "p-2" : "px-3 py-2"}`}
              title="Papelera de reciclaje"
              onClick={() => handleViewChange("recycle")}
            >
              <div className={`flex items-center ${collapsed ? "" : "gap-2"}`}>
                <RestoreFromTrashOutlinedIcon fontSize="small" />
                {!collapsed && <span className="text-sm">Papelera</span>}
              </div>
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