import { useEffect, useMemo, useState } from "react";
import { MarketplaceLogo } from "./marketplaceLogos.jsx";
import MarketplacePie from "./MarketplacePie.jsx";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ViewListIcon from "@mui/icons-material/ViewList";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

const numberFormatter = new Intl.NumberFormat("es-CL");

// Estados principales permitidos (normalizados)
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
  // Si viene desglosado por estados, sumar solo los 6 principales
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
  // Si no hay desglose, usar count como fallback
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
      id:
        marketplace?.name ??
        `tenant-${tenant?.tenantId ?? index}-marketplace-${marketplaceIndex}`,
      name: marketplace?.name ?? "Sin nombre",
      count: sumAllowedStatesCount(marketplace),
    })
  );

const CardMarketplace = ({ tenants, isAggregated }) => {
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return null;
  }

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const COLS = 3;

  useEffect(() => {
    const computeRows = () => {
      const reserved = 220;
      const available = Math.max(300, window.innerHeight - reserved);
      const itemHeight = 68;
      const nextRows = Math.max(2, Math.min(5, Math.floor(available / itemHeight)));
      setRows(nextRows);
    };
    computeRows();
    window.addEventListener("resize", computeRows);
    return () => window.removeEventListener("resize", computeRows);
  }, []);
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

  const PAGE_SIZE = COLS * rows;
  const totalItems = cardData.marketplaces.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Asegurar que la página siempre esté en rango
  const currentPage = Math.min(page, totalPages);

  const [viewMode, setViewMode] = useState("list"); // list | pie

  // Orden determinístico: primero por cantidad desc, luego por nombre asc
  const sortedMarketplaces = useMemo(() => {
    const list = Array.isArray(cardData.marketplaces)
      ? cardData.marketplaces.slice()
      : [];
    list.sort((a, b) => {
      const countDiff = (b.count || 0) - (a.count || 0);
      if (countDiff !== 0) return countDiff;
      const aName = (a.name || "").toString().toLowerCase();
      const bName = (b.name || "").toString().toLowerCase();
      return aName.localeCompare(bName);
    });
    return list;
  }, [cardData.marketplaces]);

  const paginatedMarketplaces = useMemo(() => {
    if (totalItems <= PAGE_SIZE) {
      return sortedMarketplaces;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return sortedMarketplaces.slice(start, end);
  }, [sortedMarketplaces, totalItems, currentPage]);

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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm max-w-[50vw] flex flex-col">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Marketplace por tienda
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <Tooltip title="Vista lista">
              <IconButton
                size="small"
                color={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
                aria-label="Ver como lista"
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista torta">
              <IconButton
                size="small"
                color={viewMode === "pie" ? "primary" : "default"}
                onClick={() => setViewMode("pie")}
                aria-label="Ver como gráfico de torta"
              >
                <DonutLargeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
            {cardData.title}
          </span>
          {totalItems > PAGE_SIZE && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-[11px] text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </header>

      {cardData.marketplaces.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay marketplaces registrados para esta tienda.
        </p>
      ) : (
        <div className="flex-1">
          {viewMode === "pie" ? (
            <MarketplacePie items={sortedMarketplaces} />
          ) : (
            <ul
              className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
              md:grid-cols-3
              transition-opacity duration-200 ease-out
            "
              style={{ opacity: isFading ? 0 : 1 }}
            >
              {paginatedMarketplaces.map((marketplace) => (
                <li
                  key={marketplace.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200 transition-transform duration-200 ease-out group-hover:scale-105">
                      <MarketplaceLogo name={marketplace.name} className="h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-110" />
                    </div>
                    <span className="truncate" title={marketplace.name}>
                      {marketplace.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[12px] font-medium text-indigo-700 ring-1 ring-indigo-100 transition-colors duration-200 ease-out group-hover:bg-indigo-100 group-hover:text-indigo-800">
                    {numberFormatter.format(marketplace.count || 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default CardMarketplace;

