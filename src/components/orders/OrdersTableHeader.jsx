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
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          {Array.isArray(infoChips) && infoChips.length > 0 ? (
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              {infoChips.map((chip) => (
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
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="w-full max-w-xs sm:max-w-sm">
            {hasSelection ? (
              <>
                <label className="block text-sm font-medium text-slate-700">
                  Cambiar estado
                  <div className="relative mt-1">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm text-slate-700 shadow-sm transition focus:border-catalina-blue-500 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      onChange={(event) => onChangeState(event.target.value)}
                      value={selectedState}
                      disabled={isProcessing || stateOptions.length === 0}
                    >
                      <option value="">Seleccionar estado…</option>
                      {stateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {isProcessing ? (
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-catalina-blue-500">
                        <CircularProgress size={16} />
                      </span>
                    ) : null}
                  </div>
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  {`${selectedCount} ${selectedCount === 1 ? "orden seleccionada" : "órdenes seleccionadas"
                    }`}
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Selecciona órdenes para cambiar su estado
              </div>
            )}
          </div>
          <div className="w-full max-w-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    if (!canTriggerExport || isExportingData) {
                      return;
                    }
                    onExportData();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-catalina-blue-500 hover:text-catalina-blue-600 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  disabled={!canTriggerExport || isExportingData}
                  aria-label="Exportar órdenes filtradas a Excel"
                  title="Exportar órdenes a Excel"
                >
                  {isExportingData ? (
                    <>
                      <CircularProgress size={16} />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <FileDownloadOutlinedIcon fontSize="small" />
                      Exportar Excel
                    </>
                  )}
                </button>
                {hasSelection ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!canTriggerExportSelected || isExportingSelectedData) {
                        return;
                      }
                      onExportSelectedData();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-catalina-blue-500 hover:text-catalina-blue-600 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    disabled={!canTriggerExportSelected || isExportingSelectedData}
                    aria-label="Exportar órdenes seleccionadas a Excel"
                    title="Exportar órdenes seleccionadas a Excel"
                  >
                    {isExportingSelectedData ? (
                      <>
                        <CircularProgress size={16} />
                        Exportando selección...
                      </>
                    ) : (
                      <>
                        <FileDownloadOutlinedIcon fontSize="small" />
                        Exportar selección
                      </>
                    )}
                  </button>
                ) : null}
              </div>
              <label className="relative block flex-1">
                <span className="sr-only">Buscar órdenes</span>
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <SearchIcon fontSize="small" />
                </span>
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(event) => {
                    if (shouldDisableSearch) {
                      return;
                    }
                    onSearchChange(event);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-catalina-blue-500 focus:outline-none focus:ring-2 focus:ring-catalina-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={shouldDisableSearch}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
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
  searchPlaceholder: "Buscar en cualquier campo...",
  searchDisabled: true,
  onExportData: undefined,
  isExportingData: false,
  exportDisabled: false,
  onExportSelectedData: undefined,
  isExportingSelectedData: false,
  exportSelectedDisabled: false,
};

export default OrdersTableHeader;