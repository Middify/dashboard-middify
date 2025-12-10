import PropTypes from "prop-types";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const OrdersTableHeader = ({
  title,
  subtitle,
  infoChips,
  selectedCount,
  onChangeState,
  isProcessing,
  stateOptions,
  selectedState,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchDisabled,
  onExportData,
  isExportingData,
  exportDisabled,
  onExportSelectedData,
  isExportingSelectedData,
  exportSelectedDisabled,
}) => {
  const hasSelection = selectedCount > 0;
  const shouldDisableSearch =
    typeof onSearchChange !== "function"
      ? true
      : searchDisabled ?? false;
  const canTriggerExport = typeof onExportData === "function" && !exportDisabled;
  const canTriggerExportSelected =
    hasSelection &&
    typeof onExportSelectedData === "function" &&
    !exportSelectedDisabled;

  return (
    <div className="w-full overflow-x-auto pb-1">
      <header className="mx-auto min-w-[800px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-semibold text-slate-800 whitespace-nowrap">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 whitespace-nowrap">{subtitle}</p>}
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
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onChange={(event) => onChangeState(event.target.value)}
                    value={selectedState}
                    disabled={isProcessing || stateOptions.length === 0}
                  >
                    <option value="">Cambiar estado...</option>
                    {stateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

            {/* Buscador */}
            <div className="w-full sm:max-w-xs">
              <label className="relative block w-full">
                <span className="sr-only">Buscar</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </span>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(event) => {
                    if (shouldDisableSearch) return;
                    onSearchChange(event);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={shouldDisableSearch}
                />
              </label>
            </div>

            {/* Botones de Exportación */}
            <div className="flex flex-nowrap gap-2">
              <button
                type="button"
                onClick={() => canTriggerExport && !isExportingData && onExportData()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                disabled={!canTriggerExport || isExportingData}
                title="Exportar órdenes a Excel"
              >
                {isExportingData ? (
                  <CircularProgress size={14} />
                ) : (
                  <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                )}
                <span>Exportar</span>
              </button>

              {hasSelection && (
                <button
                  type="button"
                  onClick={() => canTriggerExportSelected && !isExportingSelectedData && onExportSelectedData()}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                  disabled={!canTriggerExportSelected || isExportingSelectedData}
                  title="Exportar selección"
                >
                  {isExportingSelectedData ? (
                    <CircularProgress size={14} />
                  ) : (
                    <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                  )}
                  <span>Sel.</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

OrdersTableHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  infoChips: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      accentClass: PropTypes.string,
    })
  ),
  selectedCount: PropTypes.number,
  onChangeState: PropTypes.func,
  isProcessing: PropTypes.bool,
  stateOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selectedState: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  searchDisabled: PropTypes.bool,
  onExportData: PropTypes.func,
  isExportingData: PropTypes.bool,
  exportDisabled: PropTypes.bool,
  onExportSelectedData: PropTypes.func,
  isExportingSelectedData: PropTypes.bool,
  exportSelectedDisabled: PropTypes.bool,
};

OrdersTableHeader.defaultProps = {
  title: "Órdenes",
  subtitle: "",
  infoChips: [],
  selectedCount: 0,
  onChangeState: () => { },
  isProcessing: false,
  stateOptions: [],
  selectedState: "",
  searchValue: "",
  onSearchChange: undefined,
  searchPlaceholder: "Buscar...",
  searchDisabled: true,
  onExportData: undefined,
  isExportingData: false,
  exportDisabled: false,
  onExportSelectedData: undefined,
  isExportingSelectedData: false,
  exportSelectedDisabled: false,
};

export default OrdersTableHeader;
