import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
    useLocation,
    useNavigate,
    useSearchParams,
    useMatch,
    Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProductStates } from "../api/products/getProductStates";
import { useMarketplaceSummary } from "../api/getMarketplaceSummary";
import { useUsers } from "../api/users/getUsers";
import Navbar from "../navbar/navbar";
import Sidebar from "../navbar/sidebar";

const ORDER_STATE_IDS = new Set([
    "ingresada",
    "pendiente",
    "procesada",
    "error",
    "en_proceso",
    "descartada",
]);

const ensureOrderState = (value) =>
    value && ORDER_STATE_IDS.has(value) ? value : null;

const deriveView = (pathname, hasDetail) => {
    if (hasDetail) return "detailsOrders";
    if (pathname.startsWith("/recycle")) return "recycle";
    if (pathname.startsWith("/stores")) return "stores";
    if (pathname.startsWith("/orders")) return "orders";
    if (pathname.startsWith("/products")) return "products";
    if (pathname.startsWith("/price")) return "price";
    return "dashboard";
};

const MainLayout = () => {
    const auth = useAuth();
    const token = auth.user?.id_token;

    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const detailMatch = useMatch("/orders/:orderId");
    const detailOrderId = detailMatch?.params?.orderId ?? null;
    const resolvedOrderState = useMemo(() => ensureOrderState(searchParams.get("state")), [searchParams]);
    const resolvedProductState = searchParams.get("productState");
    const resolvedPriceState = searchParams.get("priceState");

    const [selectedTenantId, setSelectedTenantId] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lastOrderState, setLastOrderState] = useState(null);

    const currentView = useMemo(() => deriveView(location.pathname, Boolean(detailOrderId)), [location.pathname, detailOrderId]);
    
    // Polling solo si estamos en el dashboard, y aumentado a 30s para ahorrar memoria/CPU
    const autoRefresh = currentView === "dashboard" ? 30000 : null;

    const {
        tenants,
        loading: tenantsLoading,
        error: tenantsError,
    } = useProductStates(token, autoRefresh);
    
    const {
        tenants: marketplaceTenants,
        loading: marketplaceLoading,
        error: marketplaceError,
    } = useMarketplaceSummary(token, autoRefresh);
    
    const {
        user,
        loading: userLoading,
        error: userError,
    } = useUsers(token);

    const sidebarActiveView = useMemo(() => {
        if (currentView === "detailsOrders") return "orders";
        if (currentView === "products" && location.state?.from === "price") return "price";
        return currentView;
    }, [currentView, location.state]);

    useEffect(() => {
        if (currentView === "orders") {
            setLastOrderState(resolvedOrderState);
        }
    }, [currentView, resolvedOrderState]);

    const lastKnownOrderState = location.state?.fromOrderState ?? lastOrderState ?? null;
    const isLoading = tenantsLoading || marketplaceLoading || userLoading;
    const error = tenantsError || marketplaceError || userError;

    const handleChangeView = useCallback((nextView) => {
        switch (nextView) {
            case "stores": navigate("/stores"); break;
            case "orders": {
                const targetState = resolvedOrderState ?? lastOrderState ?? null;
                navigate(targetState ? `/orders?state=${encodeURIComponent(targetState)}` : "/orders");
                break;
            }
            case "dashboard": navigate("/"); break;
            case "recycle": navigate("/recycle"); break;
            case "products": navigate("/products"); break;
            case "price": navigate("/price"); break;
            default: navigate("/"); break;
        }
    }, [navigate, resolvedOrderState, lastOrderState]);

    const handleSelectOrderState = useCallback((stateId) => {
        if (stateId && ORDER_STATE_IDS.has(stateId)) {
            navigate(`/orders?state=${encodeURIComponent(stateId)}`);
        } else {
            navigate("/orders");
        }
    }, [navigate]);

    const handleSelectProductState = useCallback((stateId) => {
        navigate(stateId ? `/products?productState=${encodeURIComponent(stateId)}` : "/products");
    }, [navigate]);

    const handleSelectPriceState = useCallback((stateId) => {
        navigate(stateId ? `/price?priceState=${encodeURIComponent(stateId)}` : "/price");
    }, [navigate]);

    const handleToggleSidebarCollapse = useCallback(() => setIsSidebarCollapsed(p => !p), []);
    const handleOpenSidebar = useCallback(() => setIsSidebarOpen(true), []);
    const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);

    useEffect(() => {
        const updateSidebarState = () => {
            if (typeof window !== "undefined" && window.innerWidth >= 1024) setIsSidebarOpen(false);
        };
        window.addEventListener("resize", updateSidebarState);
        return () => window.removeEventListener("resize", updateSidebarState);
    }, []);

    const filteredTenants = useMemo(() => {
        if (!selectedTenantId) return tenants || [];
        return (tenants || []).filter(t => t.tenantId === selectedTenantId);
    }, [selectedTenantId, tenants]);

    const selectedTenantName = useMemo(() => {
        if (!selectedTenantId) return null;
        return (tenants || []).find(t => t.tenantId === selectedTenantId)?.tenantName ?? null;
    }, [selectedTenantId, tenants]);

    const filteredMarketplaceTenants = useMemo(() => {
        if (!selectedTenantId) return marketplaceTenants || [];
        return (marketplaceTenants || []).filter(t => t.tenantId === selectedTenantId);
    }, [selectedTenantId, marketplaceTenants]);

    const sidebarOrderState = currentView === "detailsOrders" ? lastKnownOrderState : resolvedOrderState;

    // MEMOIZACIÓN CRÍTICA DEL CONTEXTO: Evita que todo el árbol de React se re-renderice innecesariamente
    const contextValue = useMemo(() => ({
        token,
        user,
        isLoading,
        error,
        tenants: filteredTenants,
        marketplaceTenants: filteredMarketplaceTenants,
        selectedTenantId,
        selectedTenantName,
        resolvedOrderState,
        resolvedProductState,
        resolvedPriceState,
        lastOrderState,
        handleSelectOrderState,
        handleSelectProductState,
        handleSelectPriceState,
        isAggregated: selectedTenantId === null,
        allTenants: tenants,
        allMarketplaceTenants: marketplaceTenants,
    }), [
        token, user, isLoading, error, filteredTenants, filteredMarketplaceTenants,
        selectedTenantId, selectedTenantName, resolvedOrderState, resolvedProductState,
        resolvedPriceState, lastOrderState, handleSelectOrderState, handleSelectProductState,
        handleSelectPriceState, tenants, marketplaceTenants
    ]);

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">
            <Sidebar
                tenants={tenants}
                selectedTenantId={selectedTenantId}
                onChangeTenant={setSelectedTenantId}
                activeView={sidebarActiveView}
                onChangeView={handleChangeView}
                showTenantFilter={true}
                activeOrderState={sidebarOrderState}
                onChangeOrderState={handleSelectOrderState}
                activeProductState={resolvedProductState}
                onChangeProductState={handleSelectProductState}
                activePriceState={resolvedPriceState}
                onChangePriceState={handleSelectPriceState}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={setIsSidebarCollapsed}
                isMobileOpen={isSidebarOpen}
                onCloseMobile={handleCloseSidebar}
                userRole={user?.role ?? null}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar
                    user={user}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebarCollapse={handleToggleSidebarCollapse}
                    onToggleMobileSidebar={handleOpenSidebar}
                    activeView={sidebarActiveView}
                    activeOrderState={resolvedOrderState}
                />
                <div className="flex-1 px-4 pb-10 sm:px-6 lg:px-8 overflow-y-auto">
                    <main className="w-full mx-auto max-w-7xl">
                        <Outlet context={contextValue} />
                    </main>
                </div>
            </div>
            <ToastContainer position="bottom-right" autoClose={2000} />
        </div>
    );
};

export default MainLayout;
