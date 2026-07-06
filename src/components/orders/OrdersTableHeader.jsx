import PropTypes from "prop-types";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const OrdersTableHeader = ({
  title,
  subtitle,
  tenantName,
  infoChips,
  selectedCount,
  onChangeState,
  isProcessing,
  stateOptions,
  selectedState,
  onExportData,
  isExportingData,
  exportDisabled,
  onExportSelectedData,
  isExportingSelectedData,
  exportSelectedDisabled,
  canEditState,
  selectedMarketplace,
  onMarketplaceChange,
  orderIdFilter,
  onOrderIdChange,
  startDateFilter,
  onStartDateChange,
  endDateFilter,
  onEndDateChange,
  availableMarketplaces = [],
}) => {
  const hasSelection = selectedCount > 0;
  const hasActiveFilters = Boolean(
    selectedMarketplace || orderIdFilter || startDateFilter || endDateFilter,
  );
  const canTriggerExport =
    typeof onExportData === "function" && !exportDisabled;
  const canTriggerExportSelected =
    hasSelection &&
    typeof onExportSelectedData === "function" &&
    !exportSelectedDisabled;

  return (
    <div className="w-full overflow-x-auto pb-1">
      <header className="mx-auto min-w-[800px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">
                {title}
              </h1>
              {tenantName && (
                <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                  {tenantName}
                </span>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  {subtitle}
                </p>
              )}
            </div>
            {Array.isArray(infoChips) && infoChips.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                {infoChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 whitespace-nowrap"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      {chip.label}
                    </span>
                    <span
                      className={`text-xs font-semibold text-slate-700 ${chip.accentClass ?? ""}`}
                    >
                      {chip.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {/* Selección de Estado */}
            <div className="w-full max-w-xs sm:w-auto">
              {hasSelection ? (
                <div className="relative">
                  {(() => {
                    const ALLOWED_TRANSITIONS = [
                      "procesada",
                      "error",
                      "success",
                      "failed",
                    ];
                    const validOptions = stateOptions.filter((opt) =>
                      ALLOWED_TRANSITIONS.includes(
                        String(opt.value).toLowerCase(),
                      ),
                    );

                    return (
                      <select
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(event) => onChangeState(event.target.value)}
                        value={selectedState}
                        disabled={
                          !canEditState ||
                          isProcessing ||
                          stateOptions.length === 0
                        }
                        title={
                          !canEditState
                            ? "No tienes permisos para alterar órdenes procesadas"
                            : "Cambiar estado de las órdenes"
                        }
                      >
                        <option value="">
                          {!canEditState
                            ? " Edición Bloqueada"
                            : "Cambiar estado..."}
                        </option>
                        {/* Solo mostramos las opciones si tiene permiso */}
                        {canEditState &&
                          validOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    );
                  })()}
                  {isProcessing && (
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <CircularProgress size={12} />
                    </span>
                  )}
                </div>
              ) : (
                <div className="hidden sm:block rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 whitespace-nowrap">
                  Selecciona órdenes para editar
                </div>
              )}
            </div>

            {/* Botones de Exportación */}
            <div className="flex flex-nowrap items-center gap-2">
              {/* Texto de ayuda dinámico */}
              {!hasSelection && (
                <span className="hidden sm:block text-xs text-slate-400 italic mr-1"></span>
              )}

              {/* Botón Exportar Todo / Exportar Filtrado */}
              <button
                type="button"
                onClick={() =>
                  canTriggerExport && !isExportingData && onExportData()
                }
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap ${
                  hasSelection
                    ? "border border-slate-200 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                    : "bg-slate-800 text-white hover:bg-black"
                }`}
                disabled={!canTriggerExport || isExportingData}
                title={
                  hasActiveFilters
                    ? "Exportar las órdenes según los filtros aplicados"
                    : "Exportar todas las órdenes de la base de datos"
                }
              >
                {isExportingData && !hasSelection ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <FileDownloadOutlinedIcon className="text-[16px]" />
                )}
                <span>
                  {hasActiveFilters ? "Exportar Filtrado" : "Exportar Todo"}
                </span>
              </button>

              {/* Botón Exportar Selección */}
              {hasSelection && (
                <button
                  type="button"
                  onClick={() =>
                    canTriggerExportSelected &&
                    !isExportingSelectedData &&
                    onExportData()
                  }
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                  disabled={!canTriggerExport || isExportingData}
                  title="Exportar solo las órdenes seleccionadas"
                >
                  {isExportingData && hasSelection ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <FileDownloadOutlinedIcon className="text-[16px]" />
                  )}
                  <span>Exportar ({selectedCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Contenedor del Filtro  */}
            <div className="relative w-full sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm text-slate-600 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 capitalize cursor-pointer hover:bg-slate-100"
                value={selectedMarketplace || ""}
                onChange={onMarketplaceChange}
              >
                <option value="" className="font-medium">
                  Todas las tiendas
                </option>
                {availableMarketplaces.map((market) => (
                  <option
                    key={market.raw}
                    value={market.raw}
                    className="font-medium"
                  >
                    {market.clean}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
              </div>
            </div>

            {/* 2. Filtro de ID de Orden */}
            <div className="relative w-full sm:w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-600 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:bg-slate-100"
                value={orderIdFilter || ""}
                onChange={(e) => onOrderIdChange(e.target.value)}
              />
            </div>

            {/* 3. Filtro de Fecha */}
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-36">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-600 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:bg-slate-100 cursor-pointer"
                  value={startDateFilter || ""}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  title="Fecha desde"
                />
              </div>
              <span className="text-slate-400 text-sm font-medium">al</span>
              <div className="relative w-full sm:w-36">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-600 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:bg-slate-100 cursor-pointer"
                  value={endDateFilter || ""}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  title="Fecha hasta"
                  min={startDateFilter}
                />
              </div>
              {/* Botón para limpiar ambas fechas simultáneamente */}
              {(startDateFilter || endDateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    onStartDateChange("");
                    onEndDateChange("");
                  }}
                  className="flex items-center justify-center rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  title="Limpiar rango de fechas"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Opcional: Si en el futuro quiero poner el texto "ENCONTRADOS X" */}
            <div></div>
          </div>
        </div>
      </header>
    </div>
  );
};

OrdersTableHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  tenantName: PropTypes.string,
  infoChips: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      accentClass: PropTypes.string,
    }),
  ),
  selectedCount: PropTypes.number,
  onChangeState: PropTypes.func,
  isProcessing: PropTypes.bool,
  stateOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  selectedState: PropTypes.string,
  onExportData: PropTypes.func,
  isExportingData: PropTypes.bool,
  exportDisabled: PropTypes.bool,
  onExportSelectedData: PropTypes.func,
  isExportingSelectedData: PropTypes.bool,
  exportSelectedDisabled: PropTypes.bool,
  canEditState: PropTypes.bool,
  selectedMarketplace: PropTypes.string,
  onMarketplaceChange: PropTypes.func,
  availableMarketplaces: PropTypes.arrayOf(PropTypes.object),
};

OrdersTableHeader.defaultProps = {
  title: "Órdenes",
  subtitle: "",
  tenantName: "",
  infoChips: [],
  selectedCount: 0,
  onChangeState: () => {},
  isProcessing: false,
  stateOptions: [],
  selectedState: "",
  onExportData: undefined,
  isExportingData: false,
  exportDisabled: false,
  onExportSelectedData: undefined,
  isExportingSelectedData: false,
  exportSelectedDisabled: false,
  canEditState: true,
  onStartDateChange: () => {},
  onEndDateChange: () => {},
};

export default OrdersTableHeader;
