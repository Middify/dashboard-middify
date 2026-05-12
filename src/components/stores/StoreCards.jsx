import { useNavigate, useOutletContext } from "react-router-dom";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { CircularProgress } from "@mui/material";
import { useProductStates } from "../../api/products/getProductStates";
import { useMarketplaceSummary } from "../../api/getMarketplaceSummary";

const numberFormatter = new Intl.NumberFormat("es-CL");

const SmartStoreCard = ({ tenant, token, handleOpenStore, handleKeyDown }) => {
  const { data: productData, isLoading: loadingP } = useProductStates(
    token,
    tenant.tenantId,
  );
  const { data: marketData, isLoading: loadingM } = useMarketplaceSummary(
    token,
    tenant.tenantId,
  );

  const productTenant = Array.isArray(productData)
    ? productData[0]
    : productData;
  const marketplaceTenant = Array.isArray(marketData)
    ? marketData[0]
    : marketData;

  const name = tenant.tenantName || "Tienda Desconocida";
  const totalOrders = Number(productTenant?.total) || 0;

  const errorCount = (
    Array.isArray(productTenant?.states) ? productTenant.states : []
  ).reduce((acc, state) => {
    if (
      state?._id &&
      (state._id.toLowerCase() === "error" ||
        state._id.toLowerCase() === "errores")
    ) {
      return acc + (Number(state.count) || 0);
    }
    return acc;
  }, 0);

  const marketplacesCount = Array.isArray(marketplaceTenant?.marketplaces)
    ? marketplaceTenant.marketplaces.length
    : 0;

  const isLoading = loadingP || loadingM;
  const cardData = {
    id: tenant.tenantId,
    name,
    totalOrders,
    errorCount,
    marketplacesCount,
  };

  return (
    <article
      className="relative flex h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden"
      role="button"
      tabIndex={0}
      onClick={() => handleOpenStore(cardData)}
      onKeyDown={(event) => handleKeyDown(event, cardData)}
    >
      {/* Efecto visual mientras la tarjeta descarga sus propios datos */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <CircularProgress
              size={24}
              thickness={4}
              sx={{ color: "#4f46e5" }}
            />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">
              Conectando...
            </span>
          </div>
        </div>
      )}

      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
          <StorefrontOutlinedIcon />
        </span>
        <h3
          className="text-base font-semibold text-slate-900 truncate"
          title={name}
        >
          {name}
        </h3>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Inventory2OutlinedIcon
              fontSize="small"
              className="text-slate-400"
            />
            Órdenes totales
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {numberFormatter.format(totalOrders)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <StoreOutlinedIcon fontSize="small" className="text-slate-400" />
            Marketplaces
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {numberFormatter.format(marketplacesCount)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <span className="flex items-center gap-2">
            <ErrorOutlineIcon fontSize="small" className="text-red-400" />
            Órdenes con error
          </span>
          <span className="text-sm font-semibold text-red-600">
            {numberFormatter.format(errorCount)}
          </span>
        </div>
      </div>
    </article>
  );
};

const StoreCards = ({ authorizedTenants = [] }) => {
  const navigate = useNavigate();

  const context = useOutletContext() || {};
  const token = context.token;

  const handleOpenStore = (card) => {
    if (!card?.id) return;
    navigate(`/stores/${encodeURIComponent(card.id)}`, {
      state: { store: card },
    });
  };

  const handleKeyDown = (event, card) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenStore(card);
    }
  };

  if (!authorizedTenants || authorizedTenants.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay tiendas asignadas a este usuario.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Red de Tiendas</h2>
        <p className="text-sm text-slate-500 font-medium">
          Resumen en tiempo real de órdenes y estado de marketplaces.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {authorizedTenants.map((tenant) => (
          <SmartStoreCard
            key={tenant.tenantId}
            tenant={tenant}
            token={token}
            handleOpenStore={handleOpenStore}
            handleKeyDown={handleKeyDown}
          />
        ))}
      </div>

      <footer className="mt-6 text-xs text-slate-500">
        Mostrando {authorizedTenants.length}{" "}
        {authorizedTenants.length === 1 ? "tenant" : "tenants"}.
      </footer>
    </section>
  );
};

export default StoreCards;
