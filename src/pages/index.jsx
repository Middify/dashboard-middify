import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
  useParams,
  useMatch,
} from "react-router-dom";
import { useProductStates } from "../api/getProductStates";
import { useMarketplaceSummary } from "../api/getMarketplaceSummary";
import { useUsers } from "../api/getUsers";
import Navbar from "../navbar/navbar";
import Sidebar from "../navbar/sidebar";
import Dashboard from "./Dashboard";
import Stores from "./Stores";
import OrdersTable from "./OrdersTable";
import DetailsOrders from "./DetailsOrders";

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
  if (hasDetail) {
    return "detailsOrders";
  }
  if (pathname.startsWith("/stores")) {
    return "stores";
  }
  if (pathname.startsWith("/orders")) {
    return "orders";
  }
  return "dashboard";
};

const Index = () => {
  const auth = useAuth();
  const token = auth.user?.id_token;

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const detailMatch = useMatch("/orders/:orderId");
  const detailOrderId = detailMatch?.params?.orderId ?? null;
  const resolvedOrderState = ensureOrderState(searchParams.get("state"));

  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lastOrderState, setLastOrderState] = useState(null);

  const currentView = deriveView(location.pathname, Boolean(detailOrderId));
  const autoRefresh = currentView === "dashboard" ? 1000 : null;

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

  const sidebarActiveView =
    currentView === "detailsOrders" ? "orders" : currentView;

  useEffect(() => {
    if (currentView === "orders") {
      setLastOrderState(resolvedOrderState);
    }
  }, [currentView, resolvedOrderState]);

  useEffect(() => {
    if (location.state?.order) {
      setSelectedOrder(location.state.order);
    }
  }, [location.state]);

  const lastKnownOrderState =
    location.state?.fromOrderState ?? lastOrderState ?? null;
  const fallbackOrder = location.state?.order ?? selectedOrder ?? null;

  const isLoading = tenantsLoading || marketplaceLoading || userLoading;
  const error = tenantsError || marketplaceError || userError;

  const handleChangeView = useCallback(
    (nextView) => {
      switch (nextView) {
        case "stores":
          navigate("/stores");
          break;
        case "orders": {
          const targetState = resolvedOrderState ?? lastOrderState ?? null;
          navigate(
            targetState
              ? `/orders?state=${encodeURIComponent(targetState)}`
              : "/orders"
          );
          break;
        }
        case "dashboard":
        default:
          navigate("/");
          break;
      }
      setSelectedOrder(null);
    },
    [navigate, resolvedOrderState, lastOrderState]
  );

  const handleSelectOrderState = useCallback(
    (stateId) => {
      if (stateId && ORDER_STATE_IDS.has(stateId)) {
        navigate(`/orders?state=${encodeURIComponent(stateId)}`);
      } else {
        navigate("/orders");
      }
    },
    [navigate]
  );

  const handleSelectOrder = useCallback(
    (order) => {
      const orderId = order?._id ?? order?.id ?? null;
      if (!orderId) {
        return;
      }
      const stateToCarry = resolvedOrderState ?? lastOrderState ?? null;
      setSelectedOrder(order);
      navigate(`/orders/${encodeURIComponent(orderId)}`, {
        state: {
          order,
          fromOrderState: stateToCarry,
        },
      });
    },
    [navigate, resolvedOrderState, lastOrderState]
  );

  const handleCloseOrderDetails = useCallback(() => {
    const stateToRestore =
      location.state?.fromOrderState ?? lastOrderState ?? null;
    setSelectedOrder(null);
    if (stateToRestore && ORDER_STATE_IDS.has(stateToRestore)) {
      navigate(`/orders?state=${encodeURIComponent(stateToRestore)}`, {
        replace: true,
      });
    } else {
      navigate("/orders", { replace: true });
    }
  }, [navigate, location.state, lastOrderState]);

  const handleToggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    const updateSidebarState = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    updateSidebarState();
    window.addEventListener("resize", updateSidebarState);
    return () => window.removeEventListener("resize", updateSidebarState);
  }, []);

  const filteredTenants = useMemo(() => {
    if (!selectedTenantId) {
      return tenants || [];
    }
    return (tenants || []).filter(
      (tenant) => tenant.tenantId === selectedTenantId
    );
  }, [selectedTenantId, tenants]);

  const filteredMarketplaceTenants = useMemo(() => {
    if (!selectedTenantId) {
      return marketplaceTenants || [];
    }
    return (marketplaceTenants || []).filter(
      (tenant) => tenant.tenantId === selectedTenantId
    );
  }, [selectedTenantId, marketplaceTenants]);

  const sidebarOrderState =
    currentView === "detailsOrders" ? lastKnownOrderState : resolvedOrderState;

  const DetailsRoute = () => {
    const routeParams = useParams();
    return (
      <DetailsOrders
        token={token}
        orderId={routeParams.orderId ?? null}
        fallbackOrder={fallbackOrder}
        onClose={handleCloseOrderDetails}
      />
    );
  };

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
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={handleCloseSidebar}
      />
      <div className="flex flex-1 flex-col">
        <Navbar
          user={user}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onToggleMobileSidebar={handleOpenSidebar}
          activeView={currentView}
          activeOrderState={resolvedOrderState}
        />
        <div className="flex-1 px-4 pb-10 sm:px-6 lg:px-8">
          <main className="w-full">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    isLoading={isLoading}
                    error={error}
                    tenants={filteredTenants}
                    marketplaceTenants={filteredMarketplaceTenants}
                    isAggregated={selectedTenantId === null}
                    onSelectOrderState={handleSelectOrderState}
                  />
                }
              />
              <Route
                path="/stores"
                element={
                  <Stores
                    isLoading={isLoading}
                    error={error}
                    productTenants={tenants || []}
                    marketplaceTenants={marketplaceTenants || []}
                  />
                }
              />
              <Route
                path="/orders"
                element={
                  <OrdersTable
                    token={token}
                    selectedTenantId={selectedTenantId}
                    selectedOrderState={resolvedOrderState}
                    onSelectOrder={handleSelectOrder}
                    user={user}
                  />
                }
              />
              <Route
                path="/orders/detalle"
                element={<Navigate to="/orders" replace />}
              />
              <Route path="/orders/:orderId" element={<DetailsRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;

