import { useNavigate } from "react-router-dom";

const numberFormatter = new Intl.NumberFormat("es-CL");

const mergeTenants = (productTenants, marketplaceTenants) => {
  const productMap = new Map();
  const marketplaceMap = new Map();

  (Array.isArray(productTenants) ? productTenants : []).forEach(
    (tenant, index) => {
      if (!tenant || typeof tenant !== "object") {
        return;
      }
      const key =
        tenant.tenantId ??
        tenant.tenantName ??
        `product-tenant-${index}`;
      productMap.set(key, {
        ...tenant,
        tenantId: tenant.tenantId ?? key,
      });
    }
  );

  (Array.isArray(marketplaceTenants) ? marketplaceTenants : []).forEach(
    (tenant, index) => {
      if (!tenant || typeof tenant !== "object") {
        return;
      }
      const key =
        tenant.tenantId ??
        tenant.tenantName ??
        `marketplace-tenant-${index}`;
      marketplaceMap.set(key, {
        ...tenant,
        tenantId: tenant.tenantId ?? key,
      });
    }
  );

  const tenantIds = new Set([
    ...productMap.keys(),
    ...marketplaceMap.keys(),
  ]);

  return Array.from(tenantIds).map((tenantId, index) => {
    const productTenant =
      productMap.get(tenantId) || marketplaceMap.get(tenantId);
    const marketplaceTenant =
      marketplaceMap.get(tenantId) || productMap.get(tenantId);

    const name =
      productTenant?.tenantName ??
      marketplaceTenant?.tenantName ??
      `Tienda ${index + 1}`;

    const totalOrders = Number(productTenant?.total) || 0;

    const errorCount = (Array.isArray(productTenant?.states)
      ? productTenant.states
      : []
    ).reduce((acc, state) => {
      if (typeof state?._id === "string") {
        const normalized = state._id.trim().toLowerCase();
        if (normalized === "error" || normalized === "errores") {
          return acc + (Number(state?.count) || 0);
        }
      }
      return acc;
    }, 0);

    const marketplacesCount = (Array.isArray(
      marketplaceTenant?.marketplaces
    )
      ? marketplaceTenant.marketplaces
      : []
    ).reduce((acc, marketplace) => acc + (Number(marketplace?.count) || 0), 0);

    return {
      id: tenantId,
      name,
      totalOrders,
      marketplacesCount,
      errorCount,
    };
  });
};

const StoreCards = ({ productTenants, marketplaceTenants }) => {
  const navigate = useNavigate();
  const cards = mergeTenants(productTenants, marketplaceTenants);

  const handleOpenStore = (card) => {
    if (!card?.id) {
      return;
    }
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
        <h2 className="text-lg font-semibold text-slate-900">
          Tiendas
        </h2>
        <p className="text-sm text-slate-500">
          Resumen general de órdenes y marketplaces por tenant.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="flex h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => handleOpenStore(card)}
            onKeyDown={(event) => handleKeyDown(event, card)}
          >
            <header className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-500">
                🏢
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                {card.name}
              </h3>
            </header>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">📦 Órdenes totales</span>
                <span className="text-sm font-semibold text-slate-900">
                  {numberFormatter.format(card.totalOrders)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="flex items-center gap-2">🏬 Marketplaces</span>
                <span className="text-sm font-semibold text-slate-900">
                  {numberFormatter.format(card.marketplacesCount)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <span className="flex items-center gap-2">⚠️ Órdenes con error</span>
                <span className="text-sm font-semibold text-red-600">
                  {numberFormatter.format(card.errorCount)}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-6 text-xs text-slate-500">
        Mostrando {cards.length} {cards.length === 1 ? "tenant" : "tenants"}.
      </footer>
    </section>
  );
};

export default StoreCards;

