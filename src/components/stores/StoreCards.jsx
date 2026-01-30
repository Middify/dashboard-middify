import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const numberFormatter = new Intl.NumberFormat("es-CL");

const StoreCard = ({ card, handleOpenStore, handleKeyDown }) => {
  return (
    <article
      className="flex h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-catalina-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => handleOpenStore(card)}
      onKeyDown={(event) => handleKeyDown(event, card)}
    >
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-catalina-blue-50 text-lg text-catalina-blue-500">
          <StorefrontOutlinedIcon />
        </span>
        <h3 className="text-base font-semibold text-slate-900">{card.name}</h3>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Inventory2OutlinedIcon fontSize="small" className="text-slate-400" />
            Órdenes totales
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {numberFormatter.format(card.totalOrders)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <StoreOutlinedIcon fontSize="small" className="text-slate-400" />
            Marketplaces
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {numberFormatter.format(card.marketplacesCount)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <span className="flex items-center gap-2">
            <ErrorOutlineIcon fontSize="small" className="text-red-400" />
            Órdenes con error
          </span>
          <span className="text-sm font-semibold text-red-600">
            {numberFormatter.format(card.errorCount)}
          </span>
        </div>
      </div>
    </article>
  );
};

const StoreCards = ({ productTenants = [], marketplaceTenants = [], authorizedTenants = [] }) => {
  const navigate = useNavigate();

  // Optimize: Create a map for marketplace tenants for O(1) lookup
  const marketplaceMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(marketplaceTenants)) {
      marketplaceTenants.forEach(tenant => {
        if (tenant?.tenantId) {
          map.set(tenant.tenantId, tenant);
        }
      });
    }
    return map;
  }, [marketplaceTenants]);

  // Optimize: Create a map for product tenants
  const productMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(productTenants)) {
      productTenants.forEach(tenant => {
        if (tenant?.tenantId) {
          map.set(tenant.tenantId, tenant);
        }
      });
    }
    return map;
  }, [productTenants]);

  const cards = useMemo(() => {
    // Usamos authorizedTenants como la fuente principal de verdad para el listado
    const baseList = Array.isArray(authorizedTenants) && authorizedTenants.length > 0 
      ? authorizedTenants 
      : (Array.isArray(productTenants) ? productTenants : []);

    return baseList.map((tenant, index) => {
      if (!tenant) return null;

      const tenantId = tenant.tenantId;
      const productTenant = productMap.get(tenantId);
      const marketplaceTenant = marketplaceMap.get(tenantId);

      const name = tenant.tenantName || productTenant?.tenantName || marketplaceTenant?.tenantName || `Tienda ${index + 1}`;
      const totalOrders = Number(productTenant?.total) || 0;

      // Calculate error count directly
      const errorCount = (Array.isArray(productTenant?.states) ? productTenant.states : [])
        .reduce((acc, state) => {
          if (state?._id && (state._id.toLowerCase() === "error" || state._id.toLowerCase() === "errores")) {
            return acc + (Number(state.count) || 0);
          }
          return acc;
        }, 0);

      // Calculate marketplace count directly
      const marketplacesCount = (Array.isArray(marketplaceTenant?.marketplaces) ? marketplaceTenant.marketplaces : [])
        .reduce((acc, mp) => acc + (Number(mp?.count) || 0), 0);

      return {
        id: tenantId,
        name,
        totalOrders,
        marketplacesCount,
        errorCount
      };
    }).filter(Boolean); // Remove nulls
  }, [authorizedTenants, productTenants, productMap, marketplaceMap]);

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

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        No hay tiendas para mostrar.
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Tiendas</h2>
        <p className="text-sm text-slate-500">
          Resumen general de órdenes y marketplaces por tenant.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StoreCard
            key={card.id}
            card={card}
            handleOpenStore={handleOpenStore}
            handleKeyDown={handleKeyDown}
          />
        ))}
      </div>

      <footer className="mt-6 text-xs text-slate-500">
        Mostrando {cards.length} {cards.length === 1 ? "tenant" : "tenants"}.
      </footer>
    </section>
  );
};

export default StoreCards;

