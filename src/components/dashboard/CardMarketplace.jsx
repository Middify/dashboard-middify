import { useEffect, useMemo, useState } from "react";
import { MarketplaceLogo } from "./marketplaceLogos.jsx";
import MarketplacePie from "./MarketplacePie.jsx";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ViewListIcon from "@mui/icons-material/ViewList";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

const numberFormatter = new Intl.NumberFormat("es-CL");

const normalizeStateName = (value = "") =>
  value.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const ALLOWED_STATE_SET = new Set([
  "ingresada",
  "en proceso",
  "pendiente",
  "error",
  "descartada",
  "procesada",
]);

const sumAllowedStatesCount = (marketplace) => {
  const states = Array.isArray(marketplace?.states) ? marketplace.states : null;
  if (states && states.length > 0) {
    return states.reduce((acc, st) => {
      const key = normalizeStateName(st?._id ?? st?.name ?? "");
      if (ALLOWED_STATE_SET.has(key)) {
        return acc + (Number(st?.count) || 0);
      }
      return acc;
    }, 0);
  }
  return Number(marketplace?.count) || 0;
};

const aggregateTenants = (tenants) => {
  const map = new Map();
  tenants.forEach((tenant) => {
    (Array.isArray(tenant?.marketplaces) ? tenant.marketplaces : []).forEach(
      (marketplace) => {
        const name = marketplace?.name ?? "Sin nombre";
        const countValue = sumAllowedStatesCount(marketplace);
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
      id: marketplace?.name ?? `tenant-${tenant?.tenantId ?? index}-marketplace-${marketplaceIndex}`,
      name: marketplace?.name ?? "Sin nombre",
      count: sumAllowedStatesCount(marketplace),
    })
  );

const CardMarketplace = ({ tenants, isAggregated }) => {
  const cardData = useMemo(() => {
    if (!Array.isArray(tenants) || tenants.length === 0) return null;
    return isAggregated
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
  }, [tenants, isAggregated]);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const COLS = 3;

  useEffect(() => {
    const computeRows = () => {
      const reserved = 220;
      const available = Math.max(300, window.innerHeight - reserved);
      const itemHeight = 84;
      const nextRows = Math.max(2, Math.min(5, Math.floor(available / itemHeight)));
      setRows(nextRows);
    };
    computeRows();
    window.addEventListener("resize", computeRows);
    return () => window.removeEventListener("resize", computeRows);
  }, []);

  const PAGE_SIZE = COLS * rows;
  const totalItems = cardData?.marketplaces.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const [viewMode, setViewMode] = useState("list");

  const sortedMarketplaces = useMemo(() => {
    if (!cardData?.marketplaces) return [];
    const list = [...cardData.marketplaces];
    list.sort((a, b) => {
      const countDiff = (b.count || 0) - (a.count || 0);
      if (countDiff !== 0) return countDiff;
      return (a.name || "").toString().toLowerCase().localeCompare((b.name || "").toString().toLowerCase());
    });
    return list;
  }, [cardData?.marketplaces]);

  const paginatedMarketplaces = useMemo(() => {
    if (totalItems <= PAGE_SIZE) return sortedMarketplaces;
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedMarketplaces.slice(start, start + PAGE_SIZE);
  }, [sortedMarketplaces, totalItems, currentPage, PAGE_SIZE]);

  const [isFading, setIsFading] = useState(false);
  const goPrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setPage((p) => Math.max(1, p - 1));
      setIsFading(false);
    }, 120);
  };
  const goNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setPage((p) => Math.min(totalPages, p + 1));
      setIsFading(false);
    }, 120);
  };

  if (!cardData) return null;

  const totalOrders = sortedMarketplaces.reduce((acc, mp) => acc + (mp.count || 0), 0);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000 flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <header className="border-b border-slate-100 bg-slate-50/50 p-8 backdrop-blur-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <DonutLargeIcon className="text-catalina-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Distribución de Marketplaces
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Canales de venta activos para <span className="font-bold text-catalina-blue-600">{cardData.title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${viewMode === "list" ? "bg-catalina-blue-600 text-white shadow-md shadow-catalina-blue-200" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <ViewListIcon fontSize="small" />
              </button>
              <button
                onClick={() => setViewMode("pie")}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${viewMode === "pie" ? "bg-catalina-blue-600 text-white shadow-md shadow-catalina-blue-200" : "text-slate-400 hover:bg-slate-50"}`}
              >
                <DonutLargeIcon fontSize="small" />
              </button>
            </div>

            {totalItems > PAGE_SIZE && (
              <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-catalina-blue-600 disabled:opacity-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-[11px] font-black text-slate-400">
                  {currentPage} <span className="mx-1">/</span> {totalPages}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-catalina-blue-600 disabled:opacity-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-8">
        {cardData.marketplaces.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
            <DonutLargeIcon fontSize="large" className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No hay marketplaces activos</p>
          </div>
        ) : (
          <div className="min-h-[300px]">
            {viewMode === "pie" ? (
              <div className="flex items-center justify-center py-4">
                <MarketplacePie items={sortedMarketplaces} />
              </div>
            ) : (
              <ul
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300"
                style={{ opacity: isFading ? 0 : 1 }}
              >
                {paginatedMarketplaces.map((marketplace) => {
                  const mpPercentage = totalOrders > 0 ? (marketplace.count / totalOrders) * 100 : 0;
                  return (
                    <li
                      key={marketplace.id}
                      className="group relative flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-catalina-blue-100 hover:shadow-xl hover:shadow-catalina-blue-100/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md group-hover:ring-catalina-blue-100">
                          <MarketplaceLogo name={marketplace.name} className="h-8 w-8" />
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900">
                            {numberFormatter.format(marketplace.count || 0)}
                          </span>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Órdenes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-700 truncate max-w-[70%]" title={marketplace.name}>
                            {marketplace.name}
                          </span>
                          <span className="font-bold text-catalina-blue-600">{mpPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-catalina-blue-500 to-catalina-blue-700 transition-all duration-1000 ease-out"
                            style={{ width: `${mpPercentage}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <footer className="bg-slate-50/50 px-8 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>Total Canales: {totalItems}</span>
          <span>Actualizado en tiempo real</span>
        </div>
      </footer>
    </section>
  );
};

export default CardMarketplace;
