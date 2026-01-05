import { useCallback, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "./Dashboard";
import Stores from "./Stores";
import Products from "./Products";
import StoreDetail from "../components/stores/StoreDetail";
import OrdersTable from "./OrdersTable";
import DetailsOrders from "./DetailsOrders";
import ProductDetails from "../components/products/ProductDetails";
import RecycleBin from "./RecycleBin";
import Price from "./Price";

const DashboardWrapper = () => {
  const {
    isLoading,
    error,
    tenants,
    marketplaceTenants,
    isAggregated,
    handleSelectOrderState,
  } = useOutletContext();

  return (
    <Dashboard
      isLoading={isLoading}
      error={error}
      tenants={tenants}
      marketplaceTenants={marketplaceTenants}
      isAggregated={isAggregated}
      onSelectOrderState={handleSelectOrderState}
    />
  );
};

const StoresWrapper = () => {
  const { isLoading, error, allTenants, allMarketplaceTenants } = useOutletContext();

  return (
    <Stores
      isLoading={isLoading}
      error={error}
      productTenants={allTenants || []}
      marketplaceTenants={allMarketplaceTenants || []}
    />
  );
};

const StoreDetailWrapper = () => {
  const { token } = useOutletContext();
  return <StoreDetail token={token} />;
};

const OrdersTableWrapper = () => {
  const {
    token,
    user,
    selectedTenantId,
    selectedTenantName,
    resolvedOrderState,
  } = useOutletContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectOrder = useCallback(
    (order) => {
      const orderId = order?._id ?? order?.id ?? null;
      if (!orderId) {
        return;
      }
      setSelectedOrder(order);
      navigate(`/orders/${encodeURIComponent(orderId)}`, {
        state: {
          order,
          fromOrderState: resolvedOrderState,
        },
      });
    },
    [navigate, resolvedOrderState]
  );

  return (
    <OrdersTable
      token={token}
      selectedTenantId={selectedTenantId}
      selectedTenantName={selectedTenantName}
      selectedOrderState={resolvedOrderState}
      onSelectOrder={handleSelectOrder}
      user={user}
    />
  );
};

const RecycleBinWrapper = () => {
  const { token, user, selectedTenantId } = useOutletContext();
  const navigate = useNavigate();

  const handleSelectOrder = useCallback(
    (order) => {
      const orderId = order?._id ?? order?.id ?? null;
      if (!orderId) {
        return;
      }
      navigate(`/orders/${encodeURIComponent(orderId)}`, {
        state: { order },
      });
    },
    [navigate]
  );

  return (
    <RecycleBin
      token={token}
      selectedTenantId={selectedTenantId}
      onSelectOrder={handleSelectOrder}
      user={user}
    />
  );
};

const DetailsRoute = () => {
  const { token, lastOrderState } = useOutletContext();
  const routeParams = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackOrder = location.state?.order ?? null;
  const lastKnownOrderState = location.state?.fromOrderState ?? lastOrderState ?? null;

  const handleCloseOrderDetails = useCallback(() => {
    if (lastKnownOrderState) {
      navigate(`/orders?state=${encodeURIComponent(lastKnownOrderState)}`, {
        replace: true,
      });
    } else {
      navigate("/orders", { replace: true });
    }
  }, [navigate, lastKnownOrderState]);

  return (
    <DetailsOrders
      token={token}
      orderId={routeParams.orderId ?? null}
      fallbackOrder={fallbackOrder}
      onClose={handleCloseOrderDetails}
    />
  );
};

const ProductDetailsRoute = () => {
  const { token } = useOutletContext();
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseProductDetails = useCallback(() => {
      if (location.state?.from === 'price') {
          navigate("/price", { replace: true });
      } else {
          navigate("/products", { replace: true });
      }
  }, [navigate, location.state]);

  return (
    <ProductDetails
      token={token}
      productId={productId}
      onClose={handleCloseProductDetails}
    />
  );
};

const Index = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardWrapper />} />
        <Route path="/stores" element={<StoresWrapper />} />
        <Route path="/stores/:storeId" element={<StoreDetailWrapper />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetailsRoute />} />
        <Route path="/orders" element={<OrdersTableWrapper />} />
        <Route path="/price" element={<Price />} />
        <Route path="/recycle" element={<RecycleBinWrapper />} />
        <Route path="/orders/detalle" element={<Navigate to="/orders" replace />} />
        <Route path="/orders/:orderId" element={<DetailsRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Index;
