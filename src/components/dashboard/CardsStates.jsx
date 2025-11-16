import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

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

const STATE_DEFINITIONS = [
  { key: "ingresada", label: "Ingresada" },
  { key: "en proceso", label: "Proceso" },
  { key: "pendiente", label: "Pendiente" },
  { key: "error", label: "Error" },
  { key: "descartada", label: "Descartada" },
  { key: "procesada", label: "Procesada" },
];

const stateStyles = {
  ingresada: {
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    accent: "text-blue-600",
    gradient: "from-slate-50 via-transparent to-blue-50",
    border: "border-blue-100",
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
  descartada: {
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
  descartada: HighlightOffOutlinedIcon,
  procesada: CheckCircleOutlineOutlinedIcon,
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
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return null;
  }

  const cards = isAggregated
    ? [aggregateTenants(tenants)]
    : aggregateTenantsById(tenants);

  return (
    <section className="">
      {cards.map((card) => {
        const rawStates = Array.isArray(card.states) ? card.states : [];
        const normalizedStates = new Map();

        rawStates.forEach((state) => {
          const key = normalizeStateName(state?.name);
          if (!key) {
            return;
          }

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
          return {
            id: existing?.id ?? `${card.id}-${key}`,
            name: label,
            count: existing?.count ?? 0,
            variant: key,
          };
        });

        // Total de órdenes: únicamente suma de los 6 estados principales,
        // evitando contar estados adicionales no contemplados.
        const totalOrders = states.reduce(
          (acc, state) => acc + (Number(state?.count) || 0),
          0
        );

        const summaryChips = [
          {
            id: "total",
            label: "Órdenes totales",
            value: numberFormatter.format(totalOrders || 0),
          }
        ];

        return (
          <div key={card.id} className="space-y-6">
            {/* Header del artículo */}
            <article className="rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 sm:p-8">
              <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                    Panel de control
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
                    {card.name}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
                  {summaryChips.map((chip) => (
                    <div
                      key={chip.id}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2"
                    >
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        {chip.label}
                      </span>
                      <span
                        className={`text-sm font-semibold text-slate-700 ${chip.accentClass ?? ""}`}
                      >
                        {chip.value}
                      </span>
                    </div>
                  ))}
                </div>
              </header>
            </article>

            {/* Cards de estado fuera del article - 2 columnas en móvil, 6 en desktop */}
            {states.length > 0 && (
              <ul className="grid grid-cols-2 gap-4 text-sm md:grid-cols-6">
                {states.map((state) => {
                  const stateCount = Number(state?.count) || 0;
                  const percentage =
                    totalOrders > 0 ? (stateCount / totalOrders) * 100 : 0;
                  const formattedPercentage = `${percentage.toFixed(1)}% del total`;
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
                    if (!isClickable) {
                      return;
                    }
                    onSelectState(orderStateId || null, {
                      stateId: state.id,
                      stateName: stateLabel,
                      count: stateCount,
                      cardId: card.id,
                      cardName: card.name,
                    });
                  };

                  const handleKeyDown = (event) => {
                    if (!isClickable) {
                      return;
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleClick();
                    }
                  };

                  return (
                    <li key={state.id}>
                      <div
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        data-order-state={orderStateId}
                        className={`group relative overflow-hidden rounded-2xl border ${cardBorder} bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                          isClickable
                            ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            : ""
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br ${gradientClasses}`}
                        />
                        <div className="relative space-y-4 p-5">
                          <div className="flex items-start justify-between">
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${badgeClasses}`}
                            >
                              <span className="uppercase tracking-[0.25em] text-[11px]">
                                {stateLabel}
                              </span>
                            </div>
                            {IconComponent ? (
                              <IconComponent
                                aria-hidden
                                className="h-6 w-6 text-slate-300 transition-colors duration-200 group-hover:text-slate-400"
                              />
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black leading-none text-slate-900">
                                {numberFormatter.format(stateCount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className={`font-medium ${accentClasses}`}>
                                {percentage.toFixed(1)}%
                              </span>
                              <span className="text-slate-400">del total</span>
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