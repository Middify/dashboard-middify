import { useMemo } from "react";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const numberFormatter = new Intl.NumberFormat("es-CL");

const aggregateTenants = (
  tenants,
  { id = "all-tenants", name = "Todas las tiendas" } = {}
) => {
  const stateOrder = [];
  const stateMap = new Map();
  let total = 0;

  tenants.forEach((tenant) => {
    total += Number(tenant?.total) || 0;

    (Array.isArray(tenant?.states) ? tenant.states : []).forEach((state) => {
      const name = state?._id ?? "Sin estado";
      const countValue = Number(state?.count) || 0;

      if (!stateMap.has(name)) {
        stateOrder.push(name);
        stateMap.set(name, countValue);
      } else {
        stateMap.set(name, stateMap.get(name) + countValue);
      }
    });
  });

  const states = stateOrder.map((name) => ({
    id: name,
    name,
    count: stateMap.get(name),
  }));

  return {
    id,
    name,
    total,
    states,
  };
};

const aggregateTenantsById = (tenants = []) => {
  const groups = new Map();

  tenants.forEach((tenant, index) => {
    const id = tenant?.tenantId ?? `tenant-${index}`;
    const name = tenant?.tenantName;

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: name ?? "Sin nombre",
        entries: [],
      });
    }

    const group = groups.get(id);
    if (name && !group.hasCustomName) {
      group.name = name;
      group.hasCustomName = true;
    }

    group.entries.push(tenant);
  });

  return Array.from(groups.values()).map(({ id, name, entries }) =>
    aggregateTenants(entries, { id, name })
  );
};

export const STATE_DEFINITIONS = [
  { key: "ingresada", label: "Ingresada" },
  { key: "en proceso", label: "Proceso" },
  { key: "pendiente", label: "Pendiente" },
  { key: "error", label: "Error" },
  { key: "descartada", label: "Descartada" },
  { key: "procesada", label: "Procesada" },
];

// Mapeo de estados técnicos a los 6 estados oficiales
const STATE_MAPPING = {
  success: "procesada",
  failed: "error",
  discarded: "descartada",
  // Puedes añadir más mapeos aquí si el backend envía otros nombres
};

const stateStyles = {
  ingresada: {
    badge: "bg-catalina-blue-50 text-catalina-blue-600 border border-catalina-blue-200",
    accent: "text-catalina-blue-600",
    gradient: "from-slate-50 via-transparent to-catalina-blue-50",
    border: "border-catalina-blue-100",
  },
  "en proceso": {
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    accent: "text-amber-600",
    gradient: "from-slate-50 via-transparent to-amber-50",
    border: "border-amber-100",
  },
  pendiente: {
    badge: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    accent: "text-yellow-600",
    gradient: "from-slate-50 via-transparent to-yellow-50",
    border: "border-yellow-100",
  },
  error: {
    badge: "bg-red-50 text-red-600 border border-red-200",
    accent: "text-red-600",
    gradient: "from-slate-50 via-transparent to-red-50",
    border: "border-red-100",
  },
  failed: {
    badge: "bg-red-50 text-red-600 border border-red-200",
    accent: "text-red-600",
    gradient: "from-slate-50 via-transparent to-red-50",
    border: "border-red-100",
  },
  descartada: {
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    accent: "text-slate-700",
    gradient: "from-slate-50 via-transparent to-slate-100",
    border: "border-slate-200",
  },
  discarded: {
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    accent: "text-slate-700",
    gradient: "from-slate-50 via-transparent to-slate-100",
    border: "border-slate-200",
  },
  procesada: {
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    accent: "text-emerald-600",
    gradient: "from-slate-50 via-transparent to-emerald-50",
    border: "border-emerald-100",
  },
  success: {
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    accent: "text-emerald-600",
    gradient: "from-slate-50 via-transparent to-emerald-50",
    border: "border-emerald-100",
  },
  default: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    accent: "text-slate-600",
    gradient: "from-slate-50 via-transparent to-slate-100",
    border: "border-slate-200",
  },
};

const stateIcons = {
  ingresada: InsertDriveFileOutlinedIcon,
  "en proceso": AccessTimeOutlinedIcon,
  pendiente: WarningAmberOutlinedIcon,
  error: ErrorOutlineIcon,
  failed: ErrorOutlineIcon,
  descartada: HighlightOffOutlinedIcon,
  discarded: HighlightOffOutlinedIcon,
  procesada: CheckCircleOutlineOutlinedIcon,
  success: CheckCircleOutlineOutlinedIcon,
};

const normalizeStateName = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toOrderStateId = (value = "") =>
  normalizeStateName(value)
    .trim()
    .replace(/\s+/g, "_");

const getStateStyles = (stateName = "") => {
  const normalized = normalizeStateName(stateName);

  return stateStyles[normalized] ?? stateStyles.default;
};

const CardsStates = ({ tenants, isAggregated, onSelectState }) => {
  const cards = useMemo(() => {
    if (!Array.isArray(tenants) || tenants.length === 0) {
      return [];
    }
    return isAggregated
      ? [aggregateTenants(tenants)]
      : aggregateTenantsById(tenants);
  }, [tenants, isAggregated]);

  if (cards.length === 0) return null;

  return (
    <section className="min-h-[400px]">
      {cards.map((card) => {
        const rawStates = Array.isArray(card.states) ? card.states : [];
        const normalizedStates = new Map();

        rawStates.forEach((state) => {
          const rawKey = normalizeStateName(state?.name);
          if (!rawKey) {
            return;
          }

          // Mapear el estado técnico al estado oficial, o usar el original si no hay mapeo
          const key = STATE_MAPPING[rawKey] || rawKey;

          const currentValue = normalizedStates.get(key);
          const countValue = Number(state?.count) || 0;
          const nameValue = state?.name ?? state?.id ?? key;
          const idValue = state?.id ?? `${card.id}-${key}`;

          normalizedStates.set(key, {
            id: idValue,
            name: currentValue?.name ?? nameValue,
            count: (currentValue?.count || 0) + countValue,
          });
        });

        const states = STATE_DEFINITIONS.map(({ key, label }) => {
          const existing = normalizedStates.get(key);
          const count = existing?.count ?? 0;
          return {
            id: existing?.id ?? `${card.id}-${key}`,
            name: label,
            count: count,
            variant: key,
          };
        });

        const totalOrders = states.reduce(
          (acc, state) => acc + (Number(state?.count) || 0),
          0
        );

        return (
          <div key={card.id} className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-catalina-blue-600 text-white shadow-lg shadow-catalina-blue-200">
                  <StorefrontOutlinedIcon fontSize="large" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-catalina-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-catalina-blue-700 ring-1 ring-inset ring-catalina-blue-700/10">
                      Tienda Activa
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                    {card.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end rounded-2xl bg-white px-6 py-3 shadow-sm ring-1 ring-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Volumen Total
                  </span>
                  <span className="text-2xl font-black text-catalina-blue-600">
                    {numberFormatter.format(totalOrders || 0)}
                  </span>
                </div>
              </div>
            </header>

            {states.length > 0 && (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {states.map((state) => {
                  const stateCount = Number(state?.count) || 0;
                  const percentage =
                    totalOrders > 0 ? (stateCount / totalOrders) * 100 : 0;
                  const variantKey =
                    state?.variant ?? normalizeStateName(state?.name);
                  const theme = getStateStyles(variantKey);
                  const badgeClasses = theme.badge ?? stateStyles.default.badge;
                  const accentClasses = theme.accent ?? stateStyles.default.accent;
                  const gradientClasses =
                    theme.gradient ?? stateStyles.default.gradient;
                  const cardBorder = theme.border ?? stateStyles.default.border;
                  const stateLabel = state?.name ?? "Sin estado";
                  const IconComponent = stateIcons[variantKey] ?? null;
                  const orderStateId = toOrderStateId(variantKey);
                  const isClickable = typeof onSelectState === "function";

                  const handleClick = () => {
                    if (!isClickable) return;
                    onSelectState(orderStateId || null, {
                      stateId: state.id,
                      stateName: stateLabel,
                      count: stateCount,
                      cardId: card.id,
                      cardName: card.name,
                    });
                  };

                  return (
                    <li key={state.id} className="h-full">
                      <div
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={handleClick}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
                        data-order-state={orderStateId}
                        className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 ${cardBorder} bg-white p-1 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isClickable
                            ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-catalina-blue-500 focus-visible:ring-offset-2"
                            : ""
                          }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 bg-gradient-to-br ${gradientClasses}`}
                        />
                        
                        <div className="relative flex h-full flex-col justify-between p-5">
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 ${badgeClasses}`}
                            >
                              {IconComponent && (
                                <IconComponent
                                  aria-hidden
                                  className="h-5 w-5"
                                />
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-black uppercase tracking-widest ${accentClasses}`}>
                                {stateLabel}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black tracking-tighter text-slate-900">
                                {numberFormatter.format(stateCount)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${accentClasses.replace('text', 'bg')}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${accentClasses}`}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default CardsStates;
