import { MarketplaceLogo } from "./marketplaceLogos.jsx";

const numberFormatter = new Intl.NumberFormat("es-CL");

const aggregateTenants = (tenants) => {
  const map = new Map();

  tenants.forEach((tenant) => {
    (Array.isArray(tenant?.marketplaces) ? tenant.marketplaces : []).forEach(
      (marketplace) => {
        const name = marketplace?.name ?? "Sin nombre";
        const countValue = Number(marketplace?.count) || 0;

        map.set(name, (map.get(name) || 0) + countValue);
      }
    );
  });

  return Array.from(map.entries()).map(([name, count]) => ({
    id: name,
    name,
    count,
  }));
};

const normalizeTenantMarketplaces = (tenant, index) =>
  (Array.isArray(tenant?.marketplaces) ? tenant.marketplaces : []).map(
    (marketplace, marketplaceIndex) => ({
      id:
        marketplace?.name ??
        `tenant-${tenant?.tenantId ?? index}-marketplace-${marketplaceIndex}`,
      name: marketplace?.name ?? "Sin nombre",
      count: Number(marketplace?.count) || 0,
    })
  );

const CardMarketplace = ({ tenants, isAggregated }) => {
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return null;
  }

  const cardData = isAggregated
    ? {
        id: "marketplace-all",
        title: "Todas las tiendas",
        marketplaces: aggregateTenants(tenants),
      }
    : {
        id: `marketplace-${tenants[0].tenantId ?? "tenant"}`,
        title: tenants[0]?.tenantName ?? "Sin nombre",
        marketplaces: normalizeTenantMarketplaces(tenants[0], 0),
      };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Marketplace por tienda
        </h2>
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {cardData.title}
        </span>
      </header>

      {cardData.marketplaces.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay marketplaces registrados para esta tienda.
        </p>
      ) : (
        <ul className="space-y-3">
          {cardData.marketplaces.map((marketplace) => (
            <li
              key={marketplace.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            >
              <div className="flex items-center gap-3">
                <MarketplaceLogo name={marketplace.name} className="h-6 w-6" />
                <span className="sr-only">{marketplace.name}</span>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-indigo-600 shadow-sm">
                {numberFormatter.format(marketplace.count || 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CardMarketplace;

